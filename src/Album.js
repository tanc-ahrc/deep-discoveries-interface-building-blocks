import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {DropzoneArea} from 'material-ui-dropzone';
import TextField from '@material-ui/core/TextField';
import {useState} from 'react';
import {useEffect} from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Tooltip from '@material-ui/core/Tooltip';


const useStyles = makeStyles((theme) => ({
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(4),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  cardMedia: {
    paddingTop: '100%'
  },
  cardContent: {
    flexGrow: 1,
  },
  cardOverlay: {
    position: 'absolute',
  },
}));

export default function Album() {
  const classes = useStyles();

  const [cards, setCards] = useState([]);
  const [engine, setEngine] = useState("Style");
  const [resultCount, setResultCount] = useState(8);
  const [oldResultCount, setOldResultCount] = useState(resultCount);
  const [inputCards, setInputCards] = useState([]);


  const getSimilar = () => {
    setOldResultCount(resultCount);
    setCards([]);
    if(inputCards.length === 0) return;
    let endpoint = 'https://blockchain.surrey.ac.uk/deepdiscovery/api/upload';
    let formData = new FormData();
    for(let inputCard of inputCards) {
      if(inputCard.aid) formData.append('query_aid', inputCard.aid);
      else if(inputCard.file) formData.append('query_file', inputCard.file);
      else if(inputCard.url) formData.append('query_url', inputCard.url);
    }
    formData.append('searchengine', engine);
    formData.append('resultcount', resultCount);
    let xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);
    xhr.onload = function() {
      setCards(JSON.parse(this.responseText));
    };
    xhr.send(formData);
  }

  useEffect(getSimilar, [inputCards, engine]);

  const handleChange = (files) => {
    let newCards = [];
    for(let file of files) {
      newCards.push({
        file: file,
      });
    }
    setInputCards(newCards);
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <main>
        {/* Hero unit */}
        <div className={classes.heroContent}>
          <Grid container spacing={3} justify="space-between">
            <Grid item xs>
              <DropZone
                onChange={(f) => handleChange(f)}
                inputCards = {inputCards}
              />
            </Grid>
            <Grid item xs={3}>
              <Form
                className = {classes.heroContent}
                restoreCount = {() => {setResultCount(oldResultCount);}}
                resultCount  = {resultCount}
                onResultCountUpdate = {setResultCount}
                engine   = {engine}
                onEngineUpdate = {setEngine}
                forceUpdate = {getSimilar}
              />
            </Grid>
          </Grid>
        </div>
        <Container className={classes.cardGrid} maxWidth="md">
          {/* End hero unit */}
          <Grid container spacing={4}>
            {cards.map((card) => (
              <Grid item key={card.aid} xs={6} sm={6} md={3}>
                <ImageCard card={card}/>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
    </React.Fragment>
  );

}

function DropZone({onChange, inputCards}) {
  return(
    <div>
      <DropzoneArea
        acceptedFiles={['image/jpeg', 'image/png']}
        filesLimit = {9}
        onChange={onChange}
        fileObjects = {inputCards}
        showAlerts={['error']}
        maxFileSize={1024*1024*10}
      />
    </div>
  );
}

function getCollectionName(collection) {
  if(collection.slice(0,3) === "TNA") return "The National Archives";
  else if(collection === "RGBE") return "Royal Botanic Garden Edinburgh";
  else return collection;
}

function Watermark({collection}) {
  const classes = useStyles();
  let alt = getCollectionName(collection);
  let logo;
  if(collection.slice(0,3) === "TNA") logo = "tna.png";
  else if(collection === "RGBE") logo = "rgbe.jpeg";
  else return(
    <Typography variant="caption">
      {collection}
    </Typography>
  );

  return(
    <div className={classes.cardOverlay} style={{right:0, bottom:0}}>
      <Tooltip title={alt}>
        <img
          style={{width:40 + 'px'}}
          src={logo}
          alt={alt}
        />
      </Tooltip>
    </div>
  );
}

function Form({resultCount, onResultCountUpdate, restoreCount, engine, onEngineUpdate, forceUpdate}) {
  return(
    <Grid
      container
      direction="column"
      align-items="space-between"
      spacing={3}
    >
      <Grid item>
        <TextField
          label="Results"
          name="resultCount"
          value={resultCount}
          onChange={e => {
            let input = e.target.value;
            if(/^\d{0,3}$/.test(input)) onResultCountUpdate(input);
          }}
          onBlur = {restoreCount}
          onKeyPress = { (e) => {
            if(e.key === 'Enter') {
              if(parseInt(resultCount, 10) === 0 || resultCount === '') restoreCount();
              else forceUpdate();
            }
          }}
        />
      </Grid>
      <Grid item>
        <FormControl component="fieldset">
          <FormLabel id="engine_legend" component="legend">Search Engine</FormLabel>
          <RadioGroup
            name="engine"
            value={engine}
            onChange={e => onEngineUpdate(e.target.value)}
            aria-labelledby="engine_legend"
          >
            <FormControlLabel value="Style" control={<Radio/>} label="Style"/>
            <FormControlLabel value="Semantic" control={<Radio/>} label="Semantic"/>
          </RadioGroup>
        </FormControl>
      </Grid>
    </Grid>
  );
}

function ImageCard({card}) {
  const classes = useStyles();
  return(
    <Card className={classes.card}>
      <a href={card.url}>
        <CardMedia
          className={classes.cardMedia}
          image={card.url}
          title={card.title}
        />
      </a>
      <Watermark collection={card.collection}/>
      <CardContent className={classes.cardContent}>
        <Typography variant="caption">
          Asset ID: {card.aid}<br/>
          Distance: {card.distance}
        </Typography>
      </CardContent>
    </Card>
  );
}
