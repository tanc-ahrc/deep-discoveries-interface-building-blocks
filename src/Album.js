import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import {useState} from 'react';
import {useEffect} from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Tooltip from '@material-ui/core/Tooltip';
import { useDrop, useDrag, DndProvider } from "react-dnd";
import { NativeTypes, HTML5Backend } from "react-dnd-html5-backend";


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

  const updateFileInputs = async (files) => {
    let newCards = [];
    for(let file of files) {
      let newCard = {
        key: newCards.length,
        file: file,
      };
      newCard.url = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => { resolve(e.target.result); };
        reader.readAsDataURL(file);
      });
      newCards.push(newCard);
    }
    setInputCards(newCards);
  }

  const updateAssetInput = (card) => {
    let inputCard = Object.assign({}, card);
    delete inputCard.distance;
    inputCard.key = 0;
    setInputCards([inputCard]);
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <main>
        {/* Hero unit */}
        <DndProvider backend={HTML5Backend}>
          <div className={classes.heroContent}>
            <Grid container spacing={3} justify="space-between">
              <Grid item xs>
                <InputZone
                  onFileDrop={(f) => updateFileInputs(f)}
                  onAssetDrop={(a) => updateAssetInput(a)}
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
        </DndProvider>
      </main>
    </React.Fragment>
  );

}

function InputZone({onFileDrop, onAssetDrop, inputCards}) {
  const [, drop] = useDrop({
    accept: [NativeTypes.FILE, 'CARD'],
    drop: (item, monitor) => {
      if(monitor.getItemType() === NativeTypes.FILE) {
        let files = monitor.getItem().files;
        for(let file of files) {
          if(file.type !== 'image/jpeg' && file.type !== 'image/png') return;
        }
        onFileDrop(files);
      }
      else onAssetDrop(item.card);
    },
  });
  return(
    <div ref={drop}>
      <Grid container spacing={4}>
        {inputCards.map((card) => (
          <Grid item key={card.key} xs={6} sm={6} md={3}>
            <ImageCard card={card}/>
          </Grid>
        ))}
        <Grid item key={-1} xs={6} sm={6} md={3}>
          <ImageCard card={{url:'//:0'}}/>
        </Grid>
      </Grid>
    </div>
  );
}

function getCollectionName(collection) {
  if(collection == null) return null; /* matches on undefined or null */

  if(collection.slice(0,3) === "TNA") return "The National Archives";
  else if(collection === "RGBE") return "Royal Botanic Garden Edinburgh";
  else return collection;
}

function Watermark({collection}) {
  const classes = useStyles();
  let alt = getCollectionName(collection);
  if(alt == null) return null; /* matches on undefined or null */
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

  const [, drag] = useDrag({
   item: {
     type: 'CARD',
     card: card
   },
  });

  let t_id = null;
  if(card.aid) t_id = <Typography variant="caption">Asset ID: {card.aid}{card.distance ? <br/> : null}</Typography>
  let t_distance = null;
  if(card.distance) t_distance = <Typography variant="caption">Distance: {card.distance}</Typography>

  return(
    <Card ref={drag} className={classes.card}>
      <a href={card.url}>
        <CardMedia
          className={classes.cardMedia}
          image={card.url}
          title={card.title}
        />
      </a>
      <Watermark collection={card.collection}/>
      <CardContent className={classes.cardContent}>
        {t_id}{t_distance}
      </CardContent>
    </Card>
  );
}
