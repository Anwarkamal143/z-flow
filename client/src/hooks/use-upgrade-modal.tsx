import { openWindow } from "@/lib";
import { ErrorCode } from "@/lib/error-code.enum";
import { checkoutClient } from "@/models";
import useConfirm from "./use-confirm";

const useUpgradeModal = () => {
  const [ConfirmModal, confirm] = useConfirm({
    message: `You need an active subscription to perform this acion. Upgrade to
            Pro to unlock all features.`,
    title: "Upgrade to Pro",
  });
  const handleError = async (errorCode?: keyof typeof ErrorCode) => {
    if (errorCode === ErrorCode.ACCESS_UNAUTHORIZED) {
      const isOk = await confirm();
      if (isOk) {
        openWindow(checkoutClient.getUrl("pro"), "_self");
      }
      return true;
    }
    return false;
  };
  return { handleError, ConfirmModal };
};

export default useUpgradeModal;
