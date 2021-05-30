/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const addBookmark = /* GraphQL */ `
  mutation AddBookmark($bookmarks: BookInput!) {
    addBookmark(bookmarks: $bookmarks) {
      id
      title
      url
    }
  }
`;
export const deleteBookmark = /* GraphQL */ `
  mutation DeleteBookmark($id: String!) {
    deleteBookmark(id: $id)
  }
`;
