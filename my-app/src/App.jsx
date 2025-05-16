import { useState } from "react";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Container, Row } from 'react-bootstrap';

function CustomButton(props) {
let [buttonLang, setButtonLang] = useState(props.lang) ;
if (buttonLang ==='it')
  return <button onClick={()=>setButtonLang('en')}>Ciao!</button>;
else
  return <button onClick={()=>setButtonLang('it')}>Hello!</button>;
}

function MyButton(props) {
  let [buttonLang, setButtonLang] = useState(props.lang) ;
  if (buttonLang === 'it')
    return <Button variant='primary' onClick={()=>setButtonLang('en')}>Ciao!</Button>
  else
    return <Button variant='primary' onClick={()=>setButtonLang('it')}>Hello!</Button>
  }
function App() {

  return (
  <Container>
    <Row>
      <Col>
        Premi qui: <MyButton lang='it' />
      </Col>
    </Row>
  </Container>
  );
}

export default App
