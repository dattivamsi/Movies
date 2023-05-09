const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dataBasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("http://loaalhost:3000"));
  } catch (e) {
    console.log(`DbError:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertMovieDbToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const directorDbToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    director_name: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    select * from movie;
    `;
  const allMovies = await db.all(getMoviesQuery);
  response.send(
    allMovies.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovie = `
  INSERT into  movie(director_id,movie_name,lead_actor) values ('${directorId}','${movieName}','${leadActor}');`;
  const movie = await db.run(postMovie);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const idBasedMovie = `
  select * from movie
  WHERE movie_id = ${movieId};`;
  const movieK = await db.get(idBasedMovie);
  response.send(convertMovieDbToResponseObject(movieK));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateQuery = `
  UPDATE movie SET director_id = ${directorId},
  movie_name = ${movieName},
  lead_actor = '${leadActor}'
  WHERE movie_id = '${movieId}'; `;
  const updateMovie = await db.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
  delete from movie 
  where movie_id = ${movieId};
  `;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getData = `
    select * from director`;
  const directorDetails = await db.all(getData);
  response.send(
    directorDetails.map((eachDirector) =>
      directorDbToResponseObject(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMovies = `
  select movie_name from movie where director_id = ${directorId}`;
  const details = await db.all(directorMovies);
  response.send(
    details.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

module.exports = app;
