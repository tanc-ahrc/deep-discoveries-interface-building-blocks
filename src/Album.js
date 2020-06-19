import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CameraIcon from '@material-ui/icons/PhotoCamera';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {DropzoneArea} from 'material-ui-dropzone';
import {Component} from 'react';
import TextField from '@material-ui/core/TextField';
import {useState} from 'react';


function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
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
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
}));

export default function Album() {
  const classes = useStyles();

  const [cards, setCards] = useState(
  [
    {
      id: 2468,
      collection: "TNA3",
      url: "https://s3.eu-west-2.amazonaws.com/deepdiscovery.thumbnails/TNA3/2468.jpg",
    },
    {
      id: 2577,
      collection: "TNA3",
      url: "https://s3.eu-west-2.amazonaws.com/deepdiscovery.thumbnails/TNA3/2577.jpg"
    },
    {
      id: 2676,
      collection: "TNA3",
      url: "https://s3.eu-west-2.amazonaws.com/deepdiscovery.thumbnails/TNA3/2676.jpg"
    }
  ]);
  const [engine, setEngine] = useState("Fused");
  const [resultCount, setResultCount] = useState(30);



  const getSimilar = card => {
    let endpoint = 'https://blockchain.surrey.ac.uk/deepdiscovery/api/upload';
    let formData = new FormData();
    formData.append('file', card.url);
    formData.append('searchengine', engine);
    formData.append('resultcount', resultCount);
    let xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, false);
    xhr.send(formData);
    setCards(JSON.parse(xhr.responseText));
  }

  const handleChange = (files) => {
    if(files[0]) getSimilar({
      id: 0,
      url: files[0],
      title: "User file"
    });
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <CameraIcon className={classes.icon} />
          <Typography variant="h6" color="inherit" noWrap>
            Album layout
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        {/* Hero unit */}
        <div className={classes.heroContent}>
          <Grid container spacing={3} justify="space-between">
            <Grid item xs>
              <DropzoneArea
                onChange={(f) => handleChange(f)}
              />
            </Grid>
            <Grid item xs={3}>
              <Grid
                container direction="column"
                align-items="space-between"
              >
                <Form
                  resultCount  = {resultCount}
                  onResultCountUpdate = {setResultCount}
                  engine   = {engine}
                  onEngineUpdate = {setEngine}
                />
              </Grid>
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
                      Some information that we might get from IIIF.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary"
                            onClick={() => window.location.href=card.url}>
                      View
                    </Button>
                    <Button size="small" color="primary"
                            onClick={() => getSimilar(card)}>
                      Similar
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
      {/* Footer */}
      <footer className={classes.footer}>
        <Typography variant="h6" align="center" gutterBottom>
          Footer
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
          Something here to give the footer a purpose!
        </Typography>
        <Copyright />
      </footer>
      {/* End footer */}
    </React.Fragment>
  );

}

function Form(props) {
  return(
    <div>
      <Grid item>
        <TextField
          label="Results"
          name="resultCount"
          defaultValue={props.resultCount}
          onChange={e => props.onResultCountUpdate(e.target.value)}
        />
      </Grid>
      <Grid item>
        <TextField
          label="Engine"
          name="engine"
          defaultValue={props.engine}
          onChange={e => props.onEngineUpdate(e.target.value)}
          select
        >
          <MenuItem value="Fused">Fused</MenuItem>
          <MenuItem value="UNet">UNet</MenuItem>
          <MenuItem value="RN101">RN101</MenuItem>
          <MenuItem value="Sketch">Sketch</MenuItem>
        </TextField>
      </Grid>
    </div>
  );
}
