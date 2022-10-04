////////////////////////////////////////////////////////////////////////////////
// Copyright © 2022 xx foundation                                             //
//                                                                            //
// Use of this source code is governed by a license that can be found in the  //
// LICENSE file.                                                              //
////////////////////////////////////////////////////////////////////////////////

async function Channels(
  htmlConsole,
  messageConsole,
  stopNetworkFollowerBtn,
  ndf,
  statePath,
  statePassString
) {
  document.getElementById("startCmix").style.display = "none";

  const statePass = enc.encode(statePassString);

  console.log(
    "Starting client with:" +
      "\n\tstatePath: " +
      statePath +
      "\n\tstatePass: " +
      statePassString
  );
  htmlConsole.log("Starting client with path " + statePath);

  // Check if state exists
  if (localStorage.getItem(statePath) === null) {
    htmlConsole.log("No state found at " + statePath + ". Calling NewCmix.");

    // Initialize the state
    NewCmix(ndf, statePath, statePass, "");
  } else {
    htmlConsole.log("State found at " + statePath);
  }

  ////////////////////////////////////////////////////////////////////////////
  // Login to your client session                                           //
  ////////////////////////////////////////////////////////////////////////////

  // Login with the same statePath and statePass used to call NewCmix
  htmlConsole.log("Starting to load cmix with path " + statePath);
  let net;
  try {
    net = await LoadCmix(statePath, statePass, GetDefaultCMixParams());
  } catch (e) {
    htmlConsole.error("Failed to load Cmix: " + e);
    return;
  }
  htmlConsole.log("Loaded Cmix.");
  console.log("Loaded Cmix: " + JSON.stringify(net));

  ////////////////////////////////////////////////////////////////////////////
  // Start network threads                                                  //
  ////////////////////////////////////////////////////////////////////////////

  // Set networkFollowerTimeout to a value of your choice (seconds)
  net.StartNetworkFollower(5000);

  htmlConsole.log("Started network follower");

  stopNetworkFollowerBtn.style.display = "block";
  stopNetworkFollowerBtn.addEventListener("click", async () => {
    htmlConsole.log("Stopping network follower");
    try {
      await net.StopNetworkFollower();
    } catch (e) {
      htmlConsole.log("Failed to stop network follower: " + e);
    }
  });

  // Wait for network to become healthy
  htmlConsole.log("Waiting for network to be healthy");
  await net.WaitForNetwork(25000).then(
    () => {
      htmlConsole.log("Network is healthy");
    },
    () => {
      htmlConsole.error("Timed out. Network is not healthy.");
      throw new Error("Timed out. Network is not healthy.");
    }
  );

  let chanNameInput = document.getElementById("chanName");
  let chanDescriptionInput = document.getElementById("chanDescription");
  let makeChannelSubmit = document.getElementById("makeChannelSubmit");
  let prettyPrintInput = document.getElementById("prettyPrintInput");
  let joinChannelSubmit = document.getElementById("joinChannelSubmit");
  let usernameInput1 = document.getElementById("username1");
  let usernameInput2 = document.getElementById("username2");

  let chanNameOutput = document.getElementById("chanNameOutput");
  let chanDescriptionOutput = document.getElementById("chanDescriptionOutput");
  let chanIdOutput = document.getElementById("chanIdOutput");
  let prettyPrintOutput = document.getElementById("prettyPrintOutput");

  chanNameInput.disabled = false;
  chanDescriptionInput.disabled = false;
  makeChannelSubmit.disabled = false;
  prettyPrintInput.disabled = false;
  joinChannelSubmit.disabled = false;
  usernameInput1.disabled = false;
  usernameInput2.disabled = false;

  makeChannelSubmit.addEventListener("click", () => {
    const chanName = chanNameInput.value;
    const chanDescription = chanDescriptionInput.value;

    let chanGen = JSON.parse(
      dec.decode(GenerateChannel(net.GetID(), chanName, chanDescription))
    );

    const username = usernameInput1.value;

    joinChannel(
      htmlConsole,
      messageConsole,
      net,
      username,
      chanGen.Channel,
      chanNameOutput,
      chanDescriptionOutput,
      chanIdOutput,
      prettyPrintOutput
    );
  });

  joinChannelSubmit.addEventListener("click", () => {
    const username = usernameInput2.value;
    joinChannel(
      htmlConsole,
      messageConsole,
      net,
      username,
      prettyPrintInput.value,
      chanNameOutput,
      chanDescriptionOutput,
      chanIdOutput,
      prettyPrintOutput
    );
  });
}

async function joinChannel(
  htmlConsole,
  messageConsole,
  net,
  username,
  prettyPrint,
  nameOutput,
  descriptionOutput,
  idOutput,
  prettyPrintOutput
) {
  document.getElementById("makeChannel").style.display = "none";
  document.getElementById("joinChannel").style.display = "none";
  document.getElementById("messageLabel").innerHTML +=
    " as <em>" + username + "</em>";

  // Generate private channel identity
  let privateIdentity = GenerateChannelIdentity(net.GetID());

  /*
   * Use this when NOT using the database
   */

  let uuidCount = 0;

  // The eventModel is used only without the database
  let eventModel = {
    JoinChannel: function(channel) {},
    LeaveChannel: function(channelID) {},
    ReceiveMessage: function(
      channelID,
      messageID,
      nickname,
      text,
      identity,
      timestamp,
      lease,
      roundId,
      status
    ) {
      htmlConsole.log("Identity: " + dec.decode(identity));
      identity = jsonToObj(identity);

      let msg =
        "<strong>" +
        identity.Codename +
        "#" +
        nickname +
        "</strong><br />" +
        text +
        "<br /><br />";
      messageConsole.log(msg);
      uuidCount++;
      return uuidCount;
    },
    ReceiveReply: function(
      channelID,
      messageID,
      reactionTo,
      senderUsername,
      text,
      identity,
      timestamp,
      lease,
      roundId,
      status
    ) {
      uuidCount++;
      return uuidCount;
    },
    ReceiveReaction: function(
      channelID,
      messageID,
      reactionTo,
      senderUsername,
      reaction,
      identity,
      timestamp,
      lease,
      roundId,
      status
    ) {
      uuidCount++;
      return uuidCount;
    },
    UpdateSentStatus: function(uuid, messageID, timestamp, roundID, status) {}
  };

  let eventModelBuilder = function(path) {
    return eventModel;
  };

  // Create a channel manager that uses the event model instead of a database
  let chanManager = NewChannelsManager(
    net.GetID(),
    privateIdentity,
    eventModelBuilder
  );

  /*
   * Use this when using the database
   */
  /*
// Define callback that will receive message updates
let messageReceivedCallbackFunc = function (uuid, channelID) {
// This is where you query indexedDb and update the DOM
}

// Create a channel manager that uses a database backend
let chanManager = await NewChannelsManagerWithIndexedDb(
net.GetID(), privateIdentity, messageReceivedCallbackFunc)

// Once the channel manager is created for the first time, make sure to
// store the storage tag so that next time the page is loaded, you can load
// the already created manager
let storageTag = chanManager.GetStorageTag()

// Once a channel manager is created, on subsequent loads,
// LoadChannelsManagerWithIndexedDb must be used to create the channel
// manager
let chanManager = await LoadChannelsManagerWithIndexedDb(
net.GetID(), storageTag, messageReceivedCallbackFunc)*/

  let chanInfo;
  try {
    chanInfo = JSON.parse(dec.decode(chanManager.JoinChannel(prettyPrint)));
  } catch (e) {
    console.log(e);
    if (
      e
        .toString()
        .includes("the channel cannot be added because it already exists")
    ) {
      chanManager.ReplayChannelFromPrettyPrint(prettyPrint);
      chanInfo = JSON.parse(dec.decode(GetChannelInfo(prettyPrint)));
    } else {
      throw e;
    }
  }

  nameOutput.value = chanInfo.Name;
  descriptionOutput.value = chanInfo.Description;
  idOutput.value = chanInfo.ChannelID;
  prettyPrintOutput.value = prettyPrint;

  let sendMessageSubmit = document.getElementById("sendMessageSubmit");
  let messageInput = document.getElementById("message");
  sendMessageSubmit.disabled = false;
  messageInput.disabled = false;
  sendMessageSubmit.addEventListener("click", async () => {
    let message = messageInput.value;
    if (message !== "") {
      messageInput.value = "";
      let chanSendReportJson = await chanManager.SendMessage(
        Base64ToUint8Array(chanInfo.ChannelID),
        message,
        30000,
        new Uint8Array(null)
      );
      htmlConsole.log("chanSendReport: " + dec.decode(chanSendReportJson));
    }
  });

  messageInput.addEventListener("keypress", async e => {
    if (e.key === "Enter") {
      let message = messageInput.value;
      if (message !== "") {
        messageInput.value = "";
        let chanSendReportJson = await chanManager.SendMessage(
          Base64ToUint8Array(chanInfo.ChannelID),
          message,
          30000,
          new Uint8Array(null)
        );
        htmlConsole.log("chanSendReport: " + dec.decode(chanSendReportJson));
      }
    }
  });
}
