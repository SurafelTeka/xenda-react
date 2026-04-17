import { useInfiniteQuery } from "react-query";
import { latest_items_api } from "../../ApiRoutes";
import MainApi from "../../MainApi";
import { onSingleErrorResponse } from "../../api-error-response/ErrorResponses";

const getAggregatedProducts = async (pageParams) => {
  const { limit, pageParam } = pageParams;
  
  const { data } = await MainApi.get(
    `${latest_items_api}?limit=${limit}&offset=${pageParam}`
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
