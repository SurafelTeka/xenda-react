import { useInfiniteQuery } from "react-query";
import { latest_items_api } from "../../../ApiRoutes";
import axios from "axios";
import { onSingleErrorResponse } from "../../../api-error-response/ErrorResponses";

const getAggregatedProducts = async (pageParams) => {
  const { limit, pageParam } = pageParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  // Get headers without moduleId to aggregate across all modules
  let zoneid = undefined;
  let token = undefined;
  let language = undefined;
  let currentLocation = undefined;
  let software_id = 33571750;
  let hostname = process.env.NEXT_CLIENT_HOST_URL;

  if (typeof window !== "undefined") {
    zoneid = localStorage.getItem("zoneid");
    token = localStorage.getItem("token");
    language = JSON.parse(localStorage.getItem("language-setting"));
    currentLocation = JSON.parse(localStorage.getItem("currentLatLng"));
  }

  const headers = {
    latitude: currentLocation?.lat || 0,
    longitude: currentLocation?.lng || 0,
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-software-id": software_id,
    "ngrok-skip-browser-warning": true,
  };

  // Only add zoneid if valid (don't add moduleId to aggregate across all modules)
  const zoneidIsValid =
    zoneid &&
    zoneid !== "undefined" &&
    zoneid !== "null" &&
    !/nan/i.test(zoneid) &&
    (() => {
      try {
        const parsed = JSON.parse(zoneid);
        return (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every((id) => !Number.isNaN(Number(id)))
        );
      } catch {
        return false;
      }
    })();
  
  if (zoneidIsValid) {
    headers.zoneid = zoneid;
  }
  if (token) headers.authorization = `Bearer ${token}`;
  if (language) headers["X-localization"] = language;
  if (hostname) headers.origin = hostname;

  const { data } = await axios.get(
    `${baseUrl}${latest_items_api}?limit=${limit}&offset=${pageParam}`,
    { headers }
  );
  return data;
};

export function useGetAggregatedProducts(pageParams) {
  return useInfiniteQuery(
    ["aggregated-products"],
    ({ pageParam = 1 }) => getAggregatedProducts({ ...pageParams, pageParam }),
    {
      getNextPageParam: (lastPage, allPages) => {
        const nextPage = allPages.length + 1;
        return lastPage?.products?.length > 0 ? nextPage : undefined;
      },
      getPreviousPageParam: (firstPage, allPages) => firstPage.prevCursor,
      retry: 3,
      enabled: true,
      onError: onSingleErrorResponse,
      cacheTime: "0",
    }
  );
}
