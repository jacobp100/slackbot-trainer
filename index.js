const Slack = require("slack");
const { find, sample, sampleSize, random } = require("lodash/fp");
const {
  token,
  channelId: channel,
  callouts: { minutesBetween, numPeople },
  exercises
} = require("./config.json");

const timeout = ms => new Promise(res => setTimeout(res, ms));

const slack = new Slack({ token });

const postMessageAsSlackbot = props =>
  slack.chat.postMessage({ ...props, username: "slackbot" });

async function sendExercises() {
  const { members } = await slack.conversations.members({ channel });
  const picks = sampleSize(numPeople, members);

  const { name, units, minReps, maxReps } = sample(exercises);
  const reps = random(minReps, maxReps);

  const picksText = picks.map(pick => `<@${pick}>`).join(" ");
  const text = `${picksText} - ${reps} ${units} ${name} RIGHT NOW PLEASE!`;
  await postMessageAsSlackbot({ channel, text });
}

async function waitRandomTime() {
  const minutes = random(minutesBetween.min, minutesBetween.max);

  const text = `Next exercise in ${minutes} minutes`;
  await postMessageAsSlackbot({ channel, text });

  await timeout(minutes * 60 * 1000);
}

(async function runIndefinitely() {
  while (true) {
    await sendExercises();
    await waitRandomTime();
  }
})();
