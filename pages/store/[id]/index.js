import React, { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import MainLayout from "../../../src/components/layout/MainLayout";
import { useDispatch } from "react-redux";
import Router from "next/router";
import { setConfigData } from "redux/slices/configData";
import StoreDetails from "../../../src/components/store-details";
import { config_api, store_details_api } from "api-manage/ApiRoutes";
import SEO from "../../../src/components/seo";
import { NoSsr } from "@mui/material";
import useScrollToTop from "api-manage/hooks/custom-hooks/useScrollToTop";

const StorePage = ({ configData, storeDetails, distance }) => {
  const dispatch = useDispatch();
  useScrollToTop();

  const metaTitle = `${storeDetails?.meta_title || storeDetails?.name} - ${configData?.business_name || ""}`;
  const metaImage = storeDetails?.meta_image_full_url || storeDetails?.cover_photo_full_url;

  const manageVisitedStores = () => {
    const key = "visitedStores";
    try {
      const stored = localStorage.getItem(key);
      const visitedStores = stored ? JSON.parse(stored) : [];

      const alreadyVisited = visitedStores.some(store => store?.id === storeDetails?.id);
      if (!alreadyVisited) {
        visitedStores.push({ ...storeDetails, distance });
        localStorage.setItem(key, JSON.stringify(visitedStores));
      }
    } catch {
      // do nothing on error
    }
  };

  useEffect(() => {
    if (storeDetails) {
      manageVisitedStores();
    }

    if (configData?.maintenance_mode) {
      Router.replace("/maintainance");
    } else {
      if (configData && Object.keys(configData).length > 0) {
        dispatch(setConfigData(configData));
      }
    }
  }, [configData, storeDetails]);

  return (
    <>
      <CssBaseline />
      <SEO
        title={metaTitle}
        image={metaImage}
        businessName={configData?.business_name}
        description={storeDetails?.meta_description}
        configData={configData}
      />
      <MainLayout configData={configData}>
        <NoSsr>
          <StoreDetails storeDetails={storeDetails} configData={configData} />
        </NoSsr>
      </MainLayout>
    </>
  );
};

export default StorePage;

export const getServerSideProps = async (context) => {
  const {
    id: storeId,
    module_id: moduleId,
    lat,
    lng,
    distance,
  } = context.query;
  const { req } = context;
  const language = req.cookies.languageSetting || "en";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const origin = process.env.NEXT_CLIENT_HOST_URL;

    const headersCommon = {
      "X-software-id": 33571750,
      "X-server": "server",
      origin,
      "X-localization": language,
    };

    const configRes = await fetch(`${baseUrl}${config_api}`, {
      method: "GET",
      headers: { ...headersCommon, lat, lng },
      signal: controller.signal,
    });

    const storeDetailsRes = await fetch(`${baseUrl}${store_details_api}/${storeId}`, {
      method: "GET",
      headers: { ...headersCommon, moduleId },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (storeDetailsRes.status === 404) {
      return { notFound: true };
    }

    if (!storeDetailsRes.ok) {
      throw new Error("Store details API call failed.");
    }

    const storeDetails = await storeDetailsRes.json();

    let configData = {};
    if (configRes.ok) {
      const contentType = configRes.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          configData = await configRes.json();
        } catch {
          configData = {};
        }
      }
    }

    return {
      props: {
        configData,
        storeDetails,
        distance: distance || null,
      },
    };
  } catch (error) {
    clearTimeout(timeout);
    console.error("SSR fetch failed:", error.message);
    return { notFound: true };
  }
};
