import { useQuery } from "react-query";
import toast from "react-hot-toast";
import { zoneId_api } from "../../../ApiRoutes";
import MainApi from "../../../MainApi";

/**
 * Backend returns HTTP 404 with JSON when lat/lng is outside all zones
 * (e.g. "Service not available in this area"). Axios must not treat that as a thrown error.
 */
const getZoneId = async (location) => {
  if (location?.lat && location?.lng) {
    const res = await MainApi.get(
      `${zoneId_api}?lat=${location?.lat}&lng=${location?.lng}`,
      {
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 404,
      }
    );
    if (res.status === 404 && res.data?.errors?.length) {
      const msg = res.data.errors[0]?.message;
      if (msg) {
        toast.error(msg, { id: "zone-lookup-unavailable" });
      }
      return {
        zone_id: null,
        zone_data: null,
        errors: res.data.errors,
      };
    }
    return res?.data;
  }
};

export default function useGetZoneId(location, zoneIdEnabled) {
  return useQuery(["zoneId", location], () => getZoneId(location), {
    enabled: zoneIdEnabled,
    retry: 0,
  });
}
