type GameInfo = {
  imgSrc: string;
  imgAlt: string;
  name: string;
  description: string;
  gameId: string;
};

const gameData: GameInfo[] = [
  {
    imgSrc: "https://www.speedrun.com/static/game/o1y9wo6q/cover?v=82fa0a4",
    imgAlt: "Super Mario 64",
    name: "Super Mario 64",
    description: "View speedrun history and trends for Super Mario 64",
    gameId: "o1y9wo6q",
  },
  {
    imgSrc: "https://www.speedrun.com/static/game/j1l9qz1g/cover?v=67e956c",
    imgAlt: "The Legend of Zelda: Ocarina of Time",
    name: "The Legend of Zelda: Ocarina of Time",
    description:
      "Explore the speedrunning evolution of this classic Zelda title",
    gameId: "j1l9qz1g",
  },
  {
    imgSrc: "https://www.speedrun.com/static/game/3dx29951/cover?v=49ef265",
    imgAlt: "GoldenEye 007",
    name: "GoldenEye 007",
    description: "Discover the history of speedruns for GoldenEye 007",
    gameId: "3dx29951",
  },
];

export default gameData;
