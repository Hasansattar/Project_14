import React, { useState, useEffect } from "react"
import { addLolly } from "../graphql/mutations"
import { getLolly } from "../graphql/queries"
import shortid from "shortid"
import { API } from "aws-amplify"
import Lolly from "./lolly"
import "./style.css"
import {navigate } from "gatsby"

export default function Home() {
  const [color1, setColor1] = useState("#deaa43")
  const [color2, setColor2] = useState("#e95946")
  const [color3, setColor3] = useState("#d52358")
  const [rec, setRec] = useState("")
  const [sender, setSender] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [lollyData, setLollyData] = useState("")

  const AddLollyMutation = async () => {
    try {
      const lollyInsert = {
        id: shortid.generate(),
        c1: color1,
        c2: color2,
        c3: color3,
        rec: rec,
        sennder: sender,
        msg: message,
        link: shortid.generate(),
      }

      setRec("")
      setMessage("")
      setSender("")

      await API.graphql({
        query: addLolly,
        variables: {
          lollys: lollyInsert,
        },
      })
      navigate("/Detail")
      //fetchLolly()
    } catch (error) {
      console.log(error)
    }
  }

  const fetchLolly = async () => {
    try {
      const data = await API.graphql({
        query: getLolly,
      })
      setLollyData(data)
      setLoading(false)
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchLolly()
  }, [])

  console.log(lollyData)

  return (
    <div>
      {loading ? (
        <h1>loading...</h1>
      ) : (
        <div>
          <div className="container">
            <h1>CREATE LOLLY</h1>
            <div className="main-container">
              <div>
                <Lolly top={color1} middle={color2} bottom={color3} />
                <br />
                <input
                  type="color"
                  value={color1}
                  onChange={({ target }) => setColor1(target.value)}
                />
                <input
                  type="color"
                  value={color2}
                  onChange={({ target }) => setColor2(target.value)}
                />
                <input
                  type="color"
                  value={color3}
                  onChange={({ target }) => setColor3(target.value)}
                />
              </div>

              <div className="form-container">
                <input
                  type="text"
                  placeholder="To"
                  value={rec}
                  onChange={({ target }) => setRec(target.value)}
                />
                <textarea
                  placeholder="ENTER YOUR MESSAGE"
                  value={message}
                  onChange={({ target }) => setMessage(target.value)}
                ></textarea>
                <input
                  type="text"
                  placeholder="From"
                  value={sender}
                  onChange={({ target }) => setSender(target.value)}
                />

                <button onClick={() => AddLollyMutation()}>
                  {" "}
                  FREEZE LOLLY
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
