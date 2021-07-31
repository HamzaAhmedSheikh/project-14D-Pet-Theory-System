import React, { useState, useRef, useEffect } from "react";
import { addReport } from "../graphql/mutations";
import { getReports } from "../graphql/queries";
import { API } from "aws-amplify";
import { Container, Button, Input, Label, Heading } from 'theme-ui';
import { AppBar, Box, Grid, TextField, Toolbar, Typography, makeStyles } from "@material-ui/core";


const MyStyle = makeStyles(() => ({
  title: {
    flexGrow: 1,
    textAlign: "center",
    fontSize: "28px",    
  },
}));

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const reportDescRef = useRef<any>("");
  const reportTitleRef = useRef<any>("");
  const reportFirstName = useRef<any>("");
  const reportLastName = useRef<any>("");
  const classes = MyStyle();


  const submitReport = async () => {
    try {
      const report = {
        firstName: reportFirstName.current.value,
        lastName: reportLastName.current.value,
        reportTitle: reportTitleRef.current.value,
        desc: reportDescRef.current.value,
      }

      await API.graphql({
        query: addReport,
        variables: {
          report: report,
        },
      })

      reportFirstName.current.value = ""
      reportLastName.current.value = ""
      reportTitleRef.current.value = ""
      reportDescRef.current.value = ""      
      fetchReport();
    } catch (e) {
      console.log(e)
    }
  }

  const fetchReport = async () => {
    try {
      const data = await API.graphql({
        query: getReports,
      })
      setReportData(data);
      console.log(data);
      setLoading(false)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  return (
    <Container>
      {loading ? (        
        <Heading sx={{ color: 'black', fontFamily: 'monospace', textAlign: "center" }}>Loading...</Heading>
      ) : (
          <div>
            {/* <Heading sx={{ color: 'black', fontFamily: 'monospace', textAlign: "center" }}> Asynchronous PubSub Demo </Heading> */}
            <AppBar position="static" color="primary">
              <Toolbar>
                <Typography variant="h6" className={classes.title}>
                  <p className="heading"> Asynchronous PubSub Demo </p> 
                </Typography>
              </Toolbar>
            </AppBar> 
            <Container p={4} bg='muted'>
              <Label sx={{ color: 'black', fontFamily: 'monospace', fontSize: '14px' }}> Enter your firstName </Label>
              <Input type="text" placeholder="First Name" ref={reportFirstName}/> <br />
              <Label sx={{ color: 'black', fontFamily: 'monospace', fontSize: '14px' }}> Enter your lastName </Label>
              <Input type="text" placeholder="Last Name" ref={reportLastName}/> <br />
              <Label sx={{ color: 'black', fontFamily: 'monospace', fontSize: '14px' }}> Enter your report title </Label>
              <Input type="text" placeholder="Report Title" ref={reportTitleRef}/> <br />
              <Label sx={{ color: 'black', fontFamily: 'monospace', fontSize: '14px' }}> Enter your report description </Label>
              <Input type="text" placeholder="Report Description" ref={reportDescRef}/> <br />
              <Button
                sx={{ color: 'red', fontFamily: 'monospace', cursor: 'pointer' }}
                onClick={() => submitReport()}
              >
                Submit Report </Button> <br />
            </Container>            
          </div>
        )}
    </Container>
  )
}


