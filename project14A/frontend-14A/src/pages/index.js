import React, { useState, useRef, useEffect } from "react"
import { addTodo } from "../graphql/mutations"
import { getTodos } from "../graphql/queries"
import shortid from "shortid"
import { API } from "aws-amplify"

export default function Home() {
  const [title, setTitle] = useState("")
  const [todoData, setTodoData] = useState()
  const [loading, setLoading] = useState(true)

  const AddTodoMutation = async () => {
    try {
      const todoInsert = {
        id: shortid.generate(),
        title: title,
        done: false,
      }

      await API.graphql({
        query: addTodo,
        variables: {
          todo: todoInsert,
        },
      })

      setTitle("")
      fetchTodos()
    } catch (error) {
      console.log(error)
    }
  }

  const fetchTodos = async () => {
    try {
      const data = await API.graphql({
        query: getTodos,
      })

      setTodoData(data)
      setLoading(false)

      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  console.log(todoData)

  return (
    <div>
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <div>
          <label>
            Todo:
            <input
              value={title}
              onChange={({ target }) => setTitle(target.value)}
            />
          </label>
          <button onClick={() => AddTodoMutation()}>Add</button>
          {todoData.data &&
            todoData.data.getTodos.map((item, ind) => (
              <div style={{ marginLeft: "1rem", marginTop: "2rem" }} key={ind}>
                {item.title}{" "}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
