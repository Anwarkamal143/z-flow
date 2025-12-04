import { APP_CONFIG } from "@/config/app.config";
import { AddressService } from "@/services/address.service";
import { customerService } from "@/services/payments/customer.service";
import { UserService } from "@/services/user.service";
import {
  BadRequestException,
  NotFoundException,
  UnauthenticatedException,
} from "@/utils/catch-errors";
import { FastifyReply, FastifyRequest } from "fastify";
// Helpers

export class PolarMiddleware {
  constructor(
    private userService: UserService,
    private addressService: AddressService
  ) {}

  // --------- AUTH REQUIRED ----------
  checkAndCreatePolarCustomer = async (
    request: FastifyRequest,
    rep: FastifyReply
  ) => {
    const user = request.user;
    if (!user?.id) {
      // throw new UnauthorizedException("Not authenticated");
      return rep.status(302).redirect(APP_CONFIG.APP_URL + "/login");
    }
    const { data } = await this.userService.getUserById(user.id);
    if (!data) {
      return rep.status(302).redirect(APP_CONFIG.APP_URL + "/login");
      // throw new NotFoundException("User not found");
    }
    if (!data?.polar_customer_id) {
      const billingAddress = await this.addressService.getAddressByUserId(
        user.id
      );

      const polarCustomer =
        await customerService.createPolarCustomerWithExternalId(
          {
            email: data.email,
            name: data.name,
            billingAddress: billingAddress?.data,
          },
          user.id
        );
      if (polarCustomer.error) {
        throw polarCustomer.error;
      }
      // Update user with new Polar Customer ID
      await this.userService.updateUser(user.id, {
        polar_customer_id: polarCustomer.data.id,
      });
      request.customer = polarCustomer.data;
      return;
    }
    const polarCustomer = await customerService.getPolarCustomerByExternalId(
      user.id
    );
    if (polarCustomer.error) {
      throw polarCustomer.error;
    }
    request.customer = polarCustomer.data;
  };
  premiumSubscription = async (request: FastifyRequest, _rep: FastifyReply) => {
    const user = request.user;
    if (!user?.id) {
      throw new UnauthenticatedException("User Not Found");
    }
    const { data } = await this.userService.getUserById(user.id);

    if (!data) {
      throw new NotFoundException("User not found");
    }
    if (!data.polar_customer_id) {
      throw new NotFoundException("User don't have any subscription");
    }

    const polarCustomer =
      await customerService.getPolarCustomerActiveSubscription(
        data.polar_customer_id
      );
    if (polarCustomer.error) {
      throw new BadRequestException("Active subscription required");
    }
    request.customer = polarCustomer.data;
  };
}

export default new PolarMiddleware(new UserService(), new AddressService());
