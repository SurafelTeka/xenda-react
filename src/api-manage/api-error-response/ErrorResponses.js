import toast from "react-hot-toast";
import { t } from "i18next";
import Router from "next/router";

export const handleTokenExpire = (item, status) => {
  if (status === 401) {
    if (window.localStorage.getItem("token")) {
      toast.error(t("Your account is inactive or Your token has been expired"));
      window?.localStorage.removeItem("token");
      Router.push("/home", undefined, { shallow: true });
    }
  } else {
    toast.error(item?.message, {
      id: "error",
    });
  }
};

export const onErrorResponse = (error) => {
  error?.response?.data?.errors?.forEach((item) => {
    handleTokenExpire(item);
  });
};
export const onSingleErrorResponse = (error) => {
  if (process.env.NODE_ENV === "development") {
    if (!error?.response) {
      // eslint-disable-next-line no-console
      console.error("API error (no response)", error);
    } else if (!error?.response?.data) {
      // eslint-disable-next-line no-console
      console.error("API error (no response.data)", {
        status: error?.response?.status,
        url: error?.config?.url,
        method: error?.config?.method,
        response: error?.response,
      });
    }
  }
  toast.error(error?.response?.data?.message, {
    id: "error",
  });
  handleTokenExpire(error, error?.response?.status);
};
