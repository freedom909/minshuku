async function getReview(targetType) {
    const reviewQuery = gql`
      query GetReview($targetType: String!) {
        review(where: { targetType: $targetType }) {
          targetType
        }
      }
    `;
  
    const response = await reviewSubgraphClient.query({
      query: reviewQuery,
      variables: { targetType },
    });
  
    if (response.data) {
      return response.data.review;
    }
  
    return null;
  }