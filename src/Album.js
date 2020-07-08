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
import CircularProgress from '@material-ui/core/CircularProgress';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';


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
  const [multiInput, setMultiInput] = useState(false);
  const [fetching, setFetching] = useState(false);


  const getSimilar = () => {
    if(fetching) console.warn("Nested fetch");
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
      const f = (c) => { return c.collection != null && c.collection !== getCollectionName(c.collection); };
      setCards(JSON.parse(this.responseText).filter(f)); /* Only display images from named collections */
      setFetching(false);
    };
    setFetching(true);
    xhr.send(formData);
  }

  const getSimilarEffect = () => { if(!multiInput) getSimilar(); }

  const changeInputMode = () => {
    if(!multiInput) setInputCards([]);
  }

  useEffect(getSimilarEffect, [inputCards, engine]);
  useEffect(changeInputMode, [multiInput]);

  const updateFileInputs = async (files) => {
    let newCards = multiInput ? inputCards.slice() : [];
    for(let file of files) {
      let newCard = {
        key: newCards.length,
        file: file,
        title: file.name,
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

  const updateURLInputs = (urls) => {
    let newCards = multiInput ? inputCards.slice() : [];
    for(let url of urls) {
      newCards.push({
        key: newCards.length,
        url: url,
        title: url.substring(url.lastIndexOf('/') + 1),
      });
    }
    setInputCards(newCards);
  }

  const updateAssetInput = (card) => {
    let newCards = multiInput ? inputCards.slice() : [];
    let inputCard = Object.assign({}, card);
    delete inputCard.distance;
    inputCard.key = newCards.length;
    newCards.push(inputCard);
    setInputCards(newCards);
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
                  onURLDrop={(u) => updateURLInputs(u)}
                  onAssetDrop={(a) => updateAssetInput(a)}
                  inputCards = {inputCards}
                  showDropCard = {inputCards.length === 0 || multiInput}
                  disabled = {fetching}
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
                  multiInput = {multiInput}
                  setMultiInput = {setMultiInput}
                  disabled = {fetching}
                />
              </Grid>
            </Grid>
          </div>
          <Container className={classes.cardGrid} maxWidth="md">
            {/* End hero unit */}
            { fetching ? <CircularProgress/> : null }
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

function InputZone({onFileDrop, onURLDrop, onAssetDrop, inputCards, showDropCard, disabled}) {
  const [, drop] = useDrop({
    accept: [NativeTypes.FILE, NativeTypes.URL, 'CARD'],
    drop: (item, monitor) => {
      if(monitor.getItemType() === NativeTypes.FILE) {
        let files = monitor.getItem().files;
        for(let file of files) {
          if(file.type !== 'image/jpeg' && file.type !== 'image/png') return;
        }
        onFileDrop(files);
      }
      else if(monitor.getItemType() === NativeTypes.URL) {
        let urls = monitor.getItem().urls;
        for(let url of urls) {
          let ext = url.substring(url.lastIndexOf('.') + 1);
          if(ext !== "jpg" &&
             ext !== "jpeg" &&
             ext !== "png") return;
        }
        onURLDrop(urls);
      }
      else onAssetDrop(item.card);
    },
  });

  let dropCard = null;
  if(showDropCard) {
    dropCard = <Grid item key={-1} xs={6} sm={6} md={3}>
                 <ImageCard card={{url:'//:0'}}/>
               </Grid>;
  }

  return(
    <div ref={disabled ? null : drop}>
      <Grid container spacing={4}>
        {inputCards.map((card) => (
          <Grid item key={card.key} xs={6} sm={6} md={3}>
            <ImageCard card={card}/>
          </Grid>
        ))}
        {dropCard}
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
  if(collection.slice(0,3) === "TNA") logo = "https://www.nationalarchives.gov.uk/favicon.ico";
  else if(collection === "RGBE") logo = "https://www.rbge.org.uk/favicon.ico";
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

function Form({resultCount, onResultCountUpdate, restoreCount, engine, onEngineUpdate, forceUpdate, multiInput, setMultiInput, disabled}) {
  return(
    <Grid
      container
      direction="column"
      align-items="space-between"
      spacing={3}
    >
      <fieldset disabled={disabled}>
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
        <Grid item>
          <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={multiInput}
                onChange={e => setMultiInput(e.target.checked)}
              />
            }
            label="Multiple Inputs"
          />
          <Button variant="contained" disabled={!multiInput} onClick={forceUpdate}>Submit</Button>
          </FormGroup>
        </Grid>
      </fieldset>
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
  let t_title = null;
  if(card.title) t_title = <Typography variant="caption">{card.title}</Typography>

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
        {t_id}{t_distance}{t_title}
      </CardContent>
    </Card>
  );
}
