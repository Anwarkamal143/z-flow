import { CredentialType, eq, ICredentialType, inArray } from "@/db";

import { BaseService, ITransaction } from "./base.service";

import { credentials } from "@/db/tables";
import {
  ICredentials,
  InsertCredentials,
  UpdateCredentials,
} from "@/schema/credentials";
import { formatZodError } from "@/utils";
import { NotFoundException, ValidationException } from "@/utils/catch-errors";
import encryption from "@/utils/encryption";
import z from "zod";

export interface CreateWorkflowSecretInput {
  userId?: string;
  secret: string; // plaintext only at input time
  metadata?: Record<string, any>;
  type: ICredentialType;
}
export const createWorkflowSecretSchema = z.object({
  userId: z.string().optional(),
  secret: z.string().min(1, "Secret cannot be empty"),
  metadata: z.record(z.any(), z.unknown()).optional(),
  type: z.enum(CredentialType),
});
export class Credentialservice extends BaseService<
  typeof credentials,
  InsertCredentials,
  ICredentials,
  UpdateCredentials
> {
  constructor() {
    super(credentials);
  }

  async decryptSecretData(rows: ICredentials[]) {
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

    // 2. Return decrypted credentials
    return {
      data: decryptedData,
      error: null,
    };
  }

  /* ---------------- Create Secret ---------------- */

  async createCredentail(input: CreateWorkflowSecretInput, tx?: ITransaction) {
    const { userId, secret, type, metadata } = input;
    const parseResult = createWorkflowSecretSchema.safeParse(input);
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
        type,
      },
      tx,
    );
  }

  /* ---------------- Resolve Secret ---------------- */

  async resolveCredential(secretId: string) {
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

  async resolveById(id: string) {
    if (!id) {
      return {
        error: new ValidationException("id is required", [
          { path: "id", message: "id is required" },
        ]),
        data: null,
      };
    }
    const res = await this.findMany((t) => eq(t.id, id));

    if (!res.data)
      return {
        error: new NotFoundException("credential not found"),
        data: null,
      };

    return {
      data: await this.decryptSecretData(res.data),
      error: null,
    };
  }
  async resolveByIds(ids?: string[]) {
    if (!ids || !ids.length) {
      return {
        error: new ValidationException("NodeIds are required", [
          { path: "nodeIds", message: "nodeId is required" },
        ]),
        data: null,
      };
    }
    const res = await this.findMany((t) => inArray(t.id, ids));

    if (!res.data)
      return { error: new NotFoundException("secret not found"), data: null };

    return {
      data: await this.decryptSecretData(res.data),
      error: null,
    };
  }
}

export const credentialservice = new Credentialservice();
