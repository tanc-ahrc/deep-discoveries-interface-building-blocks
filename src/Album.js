import React from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
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
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
}));

export default function Album() {
  const classes = useStyles();

  const [cards, setCards] = useState([]);
  const [engine, setEngine] = useState("Fused");
  const [resultCount, setResultCount] = useState(30);
  const [inputCard, setInputCard] = useState(null);


  const getSimilar = () => {
    if(inputCard == null) { /* if inputCard is undefined or null */
      setCards([]);
      return;
    }
    if(resultCount === '') return;
    let endpoint = 'https://blockchain.surrey.ac.uk/deepdiscovery/api/upload';
    let formData = new FormData();
    formData.append('file', inputCard.url);
    formData.append('searchengine', engine);
    formData.append('resultcount', resultCount);
    let xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);
    xhr.onload = function() {
      setCards(JSON.parse(this.responseText));
    };
    xhr.send(formData);
  }

  useEffect(getSimilar, [inputCard, resultCount, engine]);

  const handleChange = (files) => {
    if(files[0]) {
      setInputCard({
        id: 0,
        url: files[0],
        title: "User file"
      });
    }
    else setInputCard(null);
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <main>
        {/* Hero unit */}
        <div className={classes.heroContent}>
          <Grid container spacing={3} justify="space-between">
            <Grid item xs>
              <DropzoneArea
                acceptedFiles={['image/*']}
                filesLimit = {1}
                onChange={(f) => handleChange(f)}
                fileObjects = {[inputCard]}
                showAlerts={['error']}
              />
            </Grid>
            <Grid item xs={3}>
              <Form
                className = {classes.heroContent}
                resultCount  = {resultCount}
                onResultCountUpdate = {setResultCount}
                engine   = {engine}
                onEngineUpdate = {setEngine}
              />
            </Grid>
          </Grid>
        </div>
        <Container className={classes.cardGrid} maxWidth="md">
          {/* End hero unit */}
          <Grid container spacing={4}>
            {cards.map((card) => (
              <Grid item key={card.id} xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                  <CardMedia
                    className={classes.cardMedia}
                    image={card.url}
                    title={card.title}
                  />
                  <CardContent className={classes.cardContent}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {card.title}
                    </Typography>
                    <Typography>
                      {card.collection}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary"
                            onClick={() => window.location.href=card.url}>
                      View
                    </Button>
                    <Button size="small" color="primary"
                            onClick={() => setInputCard(card)}>
                      Similar
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
    </React.Fragment>
  );

}

function Form({resultCount, onResultCountUpdate, engine, onEngineUpdate}) {
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
            <FormControlLabel value="Fused" control={<Radio/>} label="Fused"/>
            <FormControlLabel value="UNet" control={<Radio/>} label="UNet"/>
            <FormControlLabel value="RN101" control={<Radio/>} label="RN101"/>
            <FormControlLabel value="Sketch" control={<Radio/>} label="Sketch"/>
          </RadioGroup>
        </FormControl>
      </Grid>
    </Grid>
  );
}
