import { gql } from "@apollo/client";

export const GET_REPOSITORIES = gql`
  query GetRepositories {
    repositories {
      id
      name
      latestRelease {
        version
        publishedAt
        seen
      }
    }
  }
`;

export const GET_REPOSITORY_DETAILS = gql`
  query GetRepositoryDetails($name: String!) {
    repositoryDetails(name: $name) {
      name
      stars
      forks
      latestRelease {
        version
        publishedAt
        releaseNotes
      }
    }
  }
`;
