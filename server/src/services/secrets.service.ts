import { and, eq, inArray } from "@/db";

import { BaseService, ITransaction } from "./base.service";

import { secrets } from "@/db/tables";
import {
  InsertSecrets,
  InsertSecretsSchema,
  ISecrets,
  UpdateSecrets,
} from "@/schema/secrets";
import { formatZodError } from "@/utils";
import { NotFoundException, ValidationException } from "@/utils/catch-errors";
import encryption from "@/utils/encryption";

export interface CreateWorkflowSecretInput {
  workflowId?: string;
  nodeId?: string;
  userId?: string;
  secret: string; // plaintext only at input time
  metadata?: Record<string, any>;
}

export class SecretService extends BaseService<
  typeof secrets,
  InsertSecrets,
  ISecrets,
  UpdateSecrets
> {
  constructor() {
    super(secrets);
  }

  async decryptSecretData(rows: ISecrets[]) {
    // 1. Map each row to a decryption promise
    const decryptedData = await Promise.all(
      rows.map(async (r) => {
        const dek = await encryption.decryptDEK({
          ciphertext: r.dekCiphertext,
          iv: r.dekIv,
          authTag: r.dekAuthTag,
          salt: r.dekSalt,
          keyVersion: r.keyVersion,
        });

        return {
          id: r.id,
          secret: encryption.decryptSecret(
            {
              ciphertext: r.secretCiphertext,
              iv: r.secretIv,
              authTag: r.secretAuthTag,
            },
            dek,
          ),
        };
      }),
    );

    // 2. Return decrypted secrets
    return {
      data: decryptedData,
      error: null,
    };
  }

  /* ---------------- Create Secret ---------------- */

  async createSecret(input: CreateWorkflowSecretInput, tx?: ITransaction) {
    const { workflowId, nodeId, userId, secret, metadata } = input;
    const parseResult = InsertSecretsSchema.safeParse(input);
    if (!parseResult.success) {
      return {
        error: new ValidationException(
          "Invalid input data",
          formatZodError(parseResult.error),
        ),
        data: null,
      };
    }

    // 1. Generate DEK
    const dek = encryption.generateDEK();

    // 2. Encrypt secret with DEK
    const encryptedSecret = encryption.encryptSecret(secret, dek);

    // 3. Encrypt DEK with KEK
    const encryptedDEK = await encryption.encryptDEK(dek);

    return this.create(
      {
        workflowId,
        nodeId,
        userId,
        metadata,

        secretCiphertext: encryptedSecret.ciphertext,
        secretIv: encryptedSecret.iv,
        secretAuthTag: encryptedSecret.authTag,

        dekCiphertext: encryptedDEK.ciphertext,
        dekIv: encryptedDEK.iv,
        dekAuthTag: encryptedDEK.authTag,
        dekSalt: encryptedDEK.salt,
        keyVersion: encryptedDEK.keyVersion,
      },
      tx,
    );
  }

  /* ---------------- Resolve Secret ---------------- */

  async resolveSecret(secretId: string) {
    if (!secretId) {
      throw new ValidationException("SecretId is requried", [
        { path: "secretId", message: "missing secretId" },
      ]);
    }
    const res = await this.findOne((t) => eq(t.id, secretId));

    if (!res.data) {
      return { error: new NotFoundException("Secret not found"), data: null };
    }

    const row = res.data;

    return await this.decryptSecretData([row]);
  }

  /* -------- Resolve by workflow + node -------- */

  async resolveByWorkflow_Node(workflowId: string, nodeId: string) {
    const res = await this.findOne((t) =>
      and(eq(t.workflowId, workflowId), eq(t.nodeId, nodeId)),
    );

    if (!res.data)
      return { error: new NotFoundException("secret not found"), data: null };

    return await this.decryptSecretData([res.data]);
  }
  async resolveByNodeId(nodeId: string) {
    if (!nodeId) {
      return {
        error: new ValidationException("NodeId is required", [
          { path: "nodeId", message: "nodeId is required" },
        ]),
        data: null,
      };
    }
    const res = await this.findMany((t) => eq(t.nodeId, nodeId));

    if (!res.data)
      return { error: new NotFoundException("secret not found"), data: null };

    return {
      data: await this.decryptSecretData(res.data),
      error: null,
    };
  }
  async resolveByNodeIds(nodeIds: string[]) {
    if (!nodeIds || !nodeIds.length) {
      return {
        error: new ValidationException("NodeIds are required", [
          { path: "nodeIds", message: "nodeId is required" },
        ]),
        data: null,
      };
    }
    const res = await this.findMany((t) => inArray(t.nodeId, nodeIds));

    if (!res.data)
      return { error: new NotFoundException("secret not found"), data: null };

    return {
      data: await this.decryptSecretData(res.data),
      error: null,
    };
  }
}

export const secretService = new SecretService();
