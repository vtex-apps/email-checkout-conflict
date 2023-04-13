const CACHE = 180;

export default {
  settings: async (ctx: Context) => {
    const {
      clients: { checkout },
      vtex: { host, logger, storeUserAuthToken, production },
    } = ctx;

    const token: any = storeUserAuthToken;

    ctx.set("Content-Type", "application/json");
    ctx.set("Cache-Control", "no-cache, no-store");

    if (!token && !host?.includes("myvtex.com")) {
      ctx.response.body = {
        error: "User not authenticated",
      };
      ctx.response.status = 200;

      ctx.set("cache-control", "no-cache");
    } else {

      const checkoutConfig: any = await checkout
        .getOrderFormConfiguration()
        .catch((error) => {
          logger.error({
            message: "settings-getOrderformConfiguration-error",
            error,
          });
        });

      // Check if checkout has cosmo-b2b-payment-extension app
      if (
        checkoutConfig?.apps.findIndex(
          (currApp: any) => currApp.id === "cosmo-b2b-payment-extension"
        ) === -1
      ) {
        checkoutConfig.apps.push({
          major: 1,
          id: "cosmo-b2b-payment-extension",
          fields: [
            "bill_to_type", 
            "bill_to_option", 
            "bill_to_text"
          ],
        });

         await checkout
          .setOrderFormConfiguration(checkoutConfig, ctx.vtex.authToken)
          .then(() => true)
          .catch((error) => {
            logger.error({
              message: "settings-setOrderformConfiguration-error",
              error,
            });

          });


      ctx.set(
        "cache-control",
        `public, max-age=${production ? CACHE : "no-cache"}`
      );

      ctx.response.body = 'Ok';

      ctx.response.status = 200;
    }
  }
  }
};
