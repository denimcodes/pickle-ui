import React, { FC } from "react";
import { useTranslation } from "next-i18next";
import { useSelector } from "react-redux";

import FarmsTableRow from "./FarmsTableRow";
import { CoreSelectors } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { UserTokenData } from "picklefinance-core/lib/client/UserModel";
import Ping from "../connection/Ping";
import { CheckCircleIcon } from "@heroicons/react/solid";

const isPresent = (value: string): boolean => value !== "0";
const hasBalances = (x: UserTokenData): boolean =>
  isPresent(x.pAssetBalance) ||
  isPresent(x.pStakedBalance) ||
  isPresent(x.picklePending);

const LoadStatusIcon: FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (isLoading) return <Ping />;

  return <CheckCircleIcon className="w-4 h-4 mr-1 text-green-light" />;
};

interface Props {
  requiresUserModel?: boolean;
  simple?: boolean;
}

const FarmsTableBody: FC<Props> = ({ simple, requiresUserModel }) => {
  const { t } = useTranslation("common");
  const coreLoadingState = useSelector(CoreSelectors.selectLoadingState);
  const isUserModelLoading = useSelector(UserSelectors.selectIsFetching);
  const userModel = useSelector(UserSelectors.selectData);

  // TODO Should be all assets, not just jars
  let jars = useSelector(CoreSelectors.selectFilteredAssets);
  if (requiresUserModel && userModel) {
    const apiKeys = userModel.tokens
      .filter(hasBalances)
      .map((asset) => asset.assetKey);
    jars = jars.filter((jar) => apiKeys.includes(jar.details.apiKey));
  }

  const isCoreLoading = coreLoadingState !== "fulfilled";
  const isLoading = isCoreLoading || (requiresUserModel && isUserModelLoading);

  if (isLoading) {
    return (
      <tr>
        <td colSpan={6}>
          <div className="bg-black-light text-center text-sm text-gray-light py-8 rounded-xl">
            <div className="flex items-center justify-center text-gray-outline-light text-sm mb-2">
              <LoadStatusIcon isLoading={isCoreLoading} />
              <span>{t("v2.farms.loadingFarms")}</span>
            </div>
            {requiresUserModel && (
              <div className="flex items-center justify-center text-gray-outline-light text-sm mb-2">
                <LoadStatusIcon isLoading={isUserModelLoading} />
                <span>{t("v2.farms.loadingUserModel")}</span>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  }

  if (jars.length === 0)
    return (
      <tr>
        <td
          colSpan={6}
          className="bg-black-light text-gray-light text-center p-8 rounded-xl"
        >
          {t("v2.farms.noResults")}
        </td>
      </tr>
    );

  return (
    <>
      {jars.map((jar) => (
        <FarmsTableRow key={jar.details.apiKey} jar={jar} simple={simple} />
      ))}
    </>
  );
};

export default FarmsTableBody;
