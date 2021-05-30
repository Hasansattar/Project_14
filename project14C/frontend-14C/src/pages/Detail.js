import React, { useState, useEffect } from "react"
import Lolly from "./lolly"
import { getLolly } from "../graphql/queries"
import "./style.css"
import { API } from "aws-amplify"

export default function Detail() {
  const [loading, setLoading] = useState(true)

  const [lollyData, setLollyData] = useState("")

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
        <h1>Loading......</h1>
      ) : (
        <div>
          <h1>Share lolly with this link:</h1>

          {lollyData.data &&
            lollyData.data.getLolly.map(item => (
              <div className="container-lolly">
                <div key={item.id} className="display-lolly">
                  <div className="lol">
                    <Lolly top={item.c1} middle={item.c2} bottom={item.c3} />
                  </div>
                  <div className="resultCard">
                    <p className="reciever">To:{item.rec}</p>
                    <p className="message">Message:{item.msg}</p>
                    <p className="sender">From:{item.sennder}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
