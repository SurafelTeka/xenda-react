import MainApi from "../../../MainApi";
import { useQuery } from "react-query";
import { profile_info } from "../../../ApiRoutes";
import { getToken } from "../../../../helper-functions/getToken";
import {
  onErrorResponse,
  onSingleErrorResponse,
} from "../../../api-error-response/ErrorResponses";

const getUserProfile = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("Token is missing");
  }
  const { data } = await MainApi.get(profile_info);
  return data;
};

export default function useGetProfile(userOnSuccessHandler) {
  return useQuery("user-profile", getUserProfile, {
    enabled: false,
    onSuccess: userOnSuccessHandler,
    onError: onErrorResponse,
  });
}
