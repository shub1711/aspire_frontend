import { gql } from "@apollo/client";

export const ADD_REPOSITORY = gql`
  mutation AddRepository($name: String!) {
    addRepository(name: $name) {
      id
      name
      latestRelease {
        version
        publishedAt
      }
    }
  }
`;

export const MARK_RELEASE_AS_SEEN = gql`
  mutation MarkReleaseAsSeen($releaseId: Int!) {
    markReleaseAsSeen(releaseId: $releaseId)
  }
`;

export const REFRESH_REPOSITORY = gql`
  mutation RefreshRepositories($names: [String!]!) {
    refreshRepositories(names: $names)
  }
`;
