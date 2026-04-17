import { Box, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useInView } from "react-intersection-observer";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomContainer from "../container";
import ProductCard from "../cards/ProductCard";
import { useNewArrivalsInfiniteScroll } from "../../api-manage/hooks/react-query/product-details/useNewArrivals";
import { removeDuplicates } from "../../utils/CustomFunctions";
import DotSpin from "../DotSpin";
import EmptySearchResults from "../EmptySearchResults";

const AggregatedProductsSection = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.1 });

  // Check if module is available
  let hasModule = false;
  if (typeof window !== "undefined") {
    const module = localStorage.getItem("module");
    hasModule = !!module && module !== "null" && module !== "undefined";
  }

  const pageParams = {
    limit: 10,
    currentTab: 0,
  };

  const {
    data: aggregatedProducts,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    hasNextPage,
  } = useNewArrivalsInfiniteScroll(pageParams, hasModule);

  // Simulate loading state for initial load
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true);
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Handle item data aggregation from infinite pages
  const handleItemData = () => {
    if (aggregatedProducts && aggregatedProducts?.pages?.length > 0) {
      aggregatedProducts?.pages?.forEach((item) => {
        setItemData((prev) =>
          removeDuplicates([...new Set([...prev, ...(item?.products || [])])], "id")
        );
      });
    }
  };

  useEffect(() => {
    handleItemData();
  }, [aggregatedProducts]);

  // Fetch next page when sentinel is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Don't render if no module is available
  if (!hasModule) {
    return null;
  }

  if (itemData.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Box sx={{ py: { xs: "2rem", md: "3rem" } }}>
      <CustomContainer>
        <Typography
          variant="h4"
          fontWeight="700"
          mb={3}
          textAlign="center"
          sx={{
            fontSize: { xs: "24px", md: "32px" },
          }}
        >
          {t("All Products")}
        </Typography>

        {isLoading ? (
          <Box
            sx={{
              width: "100%",
              height: "50vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DotSpin />
          </Box>
        ) : (
          <>
            {itemData.length === 0 && loading ? (
              <Box
                sx={{
                  height: "100%",
                  padding: "2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EmptySearchResults text="No Products Found!" isItems />
              </Box>
            ) : (
              <>
                {itemData?.length > 0 && (
                  <Grid container rowSpacing={4} columnSpacing={2}>
                    {itemData?.map((item, index) => (
                      <Grid
                        key={item?.id}
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                      >
                        <ProductCard
                          item={item}
                          cardheight="330px"
                          cardType="vertical-type"
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}

                {isFetchingNextPage && (
                  <Box
                    sx={{
                      width: "100%",
                      height: "20vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mt: 2,
                    }}
                  >
                    <DotSpin />
                  </Box>
                )}

                {hasNextPage && (
                  <Box ref={ref} sx={{ width: "100%", height: "20px" }} />
                )}
              </>
            )}
          </>
        )}
      </CustomContainer>
    </Box>
  );
};

export default AggregatedProductsSection;
