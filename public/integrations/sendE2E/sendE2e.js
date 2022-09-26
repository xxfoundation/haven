////////////////////////////////////////////////////////////////////////////////
// Copyright © 2022 xx foundation                                             //
//                                                                            //
// Use of this source code is governed by a license that can be found in the  //
// LICENSE file.                                                              //
////////////////////////////////////////////////////////////////////////////////

async function SendE2e(htmlConsole, stopNetworkFollowerBtn, ndf,
                       recipientContactFile, myContactFileName, statePath,
                       statePassString) {

    let enc = new TextEncoder();
    let dec = new TextDecoder();

    const statePass = enc.encode(statePassString);

    console.log("Starting client with:" +
        "\n\trecipientContactFile: " + recipientContactFile +
        "\n\tmyContactFileName: " + myContactFileName +
        "\n\tstatePath: " + statePath +
        "\n\tstatePass: " + statePassString)
    htmlConsole.log("Starting client with path " + statePath)

    // Check if state exists
    if (localStorage.getItem(statePath) === null) {

        htmlConsole.log("No state found at " + statePath + ". Calling NewCmix.")

        // Initialize the state
        NewCmix(ndf, statePath, statePass, '');
    } else {
        htmlConsole.log("State found at " + statePath)
    }


    ////////////////////////////////////////////////////////////////////////////
    // Login to your client session                                           //
    ////////////////////////////////////////////////////////////////////////////

    // Login with the same statePath and statePass used to call NewCmix
    htmlConsole.log("Starting to load cmix with path " + statePath)
    let net;
    try {
        net = await LoadCmix(statePath, statePass, GetDefaultCMixParams());
    } catch (e) {
        htmlConsole.error("Failed to load Cmix: " + e)
        return
    }
    htmlConsole.log("Loaded Cmix.")
    console.log("Loaded Cmix: " + JSON.stringify(net))

    // Get reception identity (automatically created if one does not exist)
    const identityStorageKey = "identityStorageKey";
    let identity;
    try {
        htmlConsole.log("Getting reception identity.")
        identity = LoadReceptionIdentity(identityStorageKey, net.GetID());
    } catch (e) {
        htmlConsole.log("No reception identity found. Generating a new one.")

        // If no extant xxdk.ReceptionIdentity, generate and store a new one
        identity = await net.MakeReceptionIdentity();

        StoreReceptionIdentity(identityStorageKey, identity, net.GetID());
    }

    // Print contact to console.
    const myContactFile = dec.decode(GetContactFromReceptionIdentity(identity))
    htmlConsole.log("My contact file: " + encodeURIComponent(myContactFile))

    // Start contact file download
    if (myContactFileName !== '') {
        download(myContactFileName, myContactFile);
    }

    let confirm = false;
    let confirmContact;
    let e2eClient;
    let authCallbacks = {
        Confirm: function (contact, receptionId, ephemeralId, roundId) {
            confirm = true;
            confirmContact = contact

            htmlConsole.log("Confirm: from " + Uint8ArrayToBase64(receptionId) + " on round " + roundId)
        },
        Request: async function (contact, receptionId, ephemeralId, roundId) {
            htmlConsole.log("Request: from " + Uint8ArrayToBase64(receptionId) + " on round " + roundId)

            htmlConsole.log("Calling confirm on contact " + dec.decode(contact))
            const rid = await e2eClient.Confirm(contact)
            htmlConsole.log("Called confirm on round " + rid)
        },
        Reset: function (contact, receptionId, ephemeralId, roundId) {
            htmlConsole.log("Reset: from " + Uint8ArrayToBase64(receptionId) + " on round " + roundId)
        }
    }


    // Create an E2E client
    // Pass in auth object which controls auth callbacks for this client
    const params = GetDefaultE2EParams();
    htmlConsole.log("Logging in E2E")
    e2eClient = Login(net.GetID(), authCallbacks, identity, new Uint8Array());
    htmlConsole.log("Logged in E2E")

    ////////////////////////////////////////////////////////////////////////////
    // Start network threads                                                  //
    ////////////////////////////////////////////////////////////////////////////

    // Set networkFollowerTimeout to a value of your choice (seconds)
    net.StartNetworkFollower(5000);

    htmlConsole.log("Started network follower")

    stopNetworkFollowerBtn.style.display = 'block';
    stopNetworkFollowerBtn.addEventListener('click', async () => {
        htmlConsole.log("Stopping network follower")
        try {
            await net.StopNetworkFollower()
        } catch (e) {
            htmlConsole.log("Failed to stop network follower: " + e)
        }
    })

    // Wait for network to become healthy
    htmlConsole.log("Waiting for network to be healthy")
    await net.WaitForNetwork(25000).then(
        () => {
            htmlConsole.log("Network is healthy")
        },
        () => {
            htmlConsole.error("Timed out. Network is not healthy.")
            throw new Error("Timed out. Network is not healthy.")
        }
    )


    ////////////////////////////////////////////////////////////////////////////
    // Register a listener for messages                                       //
    ////////////////////////////////////////////////////////////////////////////

    let listener = {
        Hear: function (item) {
            htmlConsole.log("Listener heard: " + dec.decode(item))
            const message = JSON.parse(dec.decode(item))
            htmlConsole.log("Listener message: " + atob(message.Payload))

            document.getElementById("lastReceivedMessage").innerHTML = atob(message.Payload)
        },
        Name: function () {
            return "Listener";
        }
    }

    // Listen for all types of messages using catalog.NoType
    // Listen for messages from all users using id.ZeroUser
    let zerUser = Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3]);
    e2eClient.RegisterListener(zerUser, 0, listener);
    htmlConsole.log("Registered listener.")

    ////////////////////////////////////////////////////////////////////////////
    // Connect with the recipient                                             //
    ////////////////////////////////////////////////////////////////////////////

    // Check that the partner exists
    if (recipientContactFile !== '') {
        let exists = false;
        htmlConsole.log("getting ID from contact")
        const recipientContactID = GetIDFromContact(enc.encode(recipientContactFile));
        const recipientContactIDBase64 = Uint8ArrayToBase64(recipientContactID)

        htmlConsole.log("Checking if partner " + recipientContactIDBase64 + " exists")

        const partnerIDS = dec.decode(e2eClient.GetAllPartnerIDs())
        console.log("partnerIDS: " + partnerIDS)

        let partners = JSON.parse(partnerIDS);
        for (let i = 0; i < partners.length; i++) {
            console.log("Checking partner #" + i + ": " + partners[i] + " matches recipient " + recipientContactIDBase64)
            if (partners[i] === recipientContactIDBase64) {
                htmlConsole.log("Already partner with " + recipientContactIDBase64)
                exists = true;
                break
            }
        }

        // If the partner does not exist, send a request
        if (exists === false) {
            htmlConsole.log("Partner does not exist, Request being sent to " + recipientContactIDBase64)
            const factList = enc.encode('[]')
            const rid = await e2eClient.Request(enc.encode(recipientContactFile), factList)
            htmlConsole.log("Request sent on round " + rid)


            htmlConsole.log("Waiting to receive confirmation.")
            try {
                await sleepUntil(() => confirm === true, 90000);
                htmlConsole.log("Received confirmation: " + confirm)
            } catch {
                htmlConsole.error("Timed out. Did not receive confirm: " + confirm)
                throw new Error("Did not receive confirm: " + confirm)
            }

            console.log("confirmContact: " + confirmContact)
            console.log("confirmContact: " + dec.decode(confirmContact))
            const confirmContactID = GetIDFromContact(confirmContact)
            if (!Uint8ArrayEquals(recipientContactID, confirmContactID)) {
                htmlConsole.log("contact ID from confirmation " +
                    Uint8ArrayToBase64(confirmContactID) +
                    " does not match recipient ID " + recipientContactIDBase64)
                throw new Error("contact ID from confirmation " +
                    Uint8ArrayToBase64(confirmContactID) +
                    " does not match recipient ID " + recipientContactIDBase64)
            }
        } else {
            htmlConsole.log("Partner exists")
        }

        ////////////////////////////////////////////////////////////////////////////
        // Send a message to the recipient                                        //
        ////////////////////////////////////////////////////////////////////////////

        // Test message
        const msgBody = "Message: If this message is sent successfully, we'll have established contact with the recipient."

        htmlConsole.log("Sending E2E message: " + msgBody)
        const e2eSendReport = await e2eClient.SendE2E(2, recipientContactID, enc.encode(msgBody), params)

        htmlConsole.log("Send E2e message. Report: " + dec.decode(e2eSendReport))

        document.getElementById("messageSend").addEventListener("click", async ev => {
            let messageInput = document.getElementById("messageInput")
            let msg = messageInput.value
            messageInput.value = ""

            htmlConsole.log("Sending E2E message: " + msg)
            const e2eSendReport = await e2eClient.SendE2E(2, recipientContactID, enc.encode(msg), params)

            htmlConsole.log("Send E2e message. Report: " + dec.decode(e2eSendReport))
        })
    } else {
        htmlConsole.log("No recipient specified. Waiting for request")
    }
}