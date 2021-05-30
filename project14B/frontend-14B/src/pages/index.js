import React, { useEffect, useState } from "react"
import { addBookmark, deleteBookmark } from "../graphql/mutations"
import { getBookmark } from "../graphql/queries"
import shortid from "shortid"
import { API } from "aws-amplify"

export default function Home() {
  const [bookData, setBookData] = useState("")
  const [addtitle, setAddTitle] = useState("")
  const [addUrl, setAddUrl] = useState("")
  const [loading, setLoading] = useState(true)

  const AddBookmarkMutation = async () => {
    try {
      const bookInsert = {
        id: shortid.generate(),
        title: addtitle,
        url: addUrl,
      }
      setAddTitle("")
      setAddUrl("")

      await API.graphql({
        query: addBookmark,
        variables: {
          bookmarks: bookInsert,
        },
      })

      fetchBookMArk()
    } catch (error) {
      console.log(error)
    }
  }

  const DeleteBookMark = async id => {
    await API.graphql({
      query: deleteBookmark,
      variables: {
        id: id,
      },
    })
    fetchBookMArk()
  }

  const fetchBookMArk = async () => {
    try {
      const data = await API.graphql({
        query: getBookmark,
      })
      setBookData(data)
      setLoading(false)

      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchBookMArk()
  }, [])
  console.log(bookData)

  return (
    <div>
      {loading ? (
        <h1>loading....</h1>
      ) : (
        <div>
          <h2>ADD NEW BOOKMARK</h2>

          <label>
            BOOK NAME
            <input
              type="text"
              onChange={({ target }) => setAddTitle(target.value)}
              value={addtitle}
            />{" "}
            <br />
            BOOK URL
            <input
              type="text"
              onChange={({ target }) => setAddUrl(target.value)}
              value={addUrl}
            />
          </label>
          <br />
          <button onClick={() => AddBookmarkMutation()}> ADD BOOK</button>
          <div>
            {bookData.data &&
              bookData.data.getBookmark.map(item => (
                <div
                  style={{ marginLeft: "1rem", marginTop: "2rem" }}
                  key={item.id}
                >
                  id : {item.id} title: {item.title} url: {item.url}
                  <button onClick={() => DeleteBookMark(item.id)}>
                    {" "}
                    DELETE BOOK
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
