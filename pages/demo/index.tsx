import { NextPage } from "next";
import Head from "next/head";

const Demo: NextPage = () => {
  return (
    <>
      <Head key="demo">
        <meta charSet="UTF-8" />
        <title>The Internet Speakeasy Client</title>

        <link rel="stylesheet" type="text/css" href="../assets/styles.css" />
        <link rel="icon" type="image/x-icon" href="favicon.ico" />

        <script
          type="text/javascript"
          src="../../integrations/channels/channels.js"
        ></script>
        <script
          type="text/javascript"
          src="../../integrations/assets/utils.js"
        ></script>
        <script
          type="text/javascript"
          src="../../integrations/assets/wasm_exec.js"
        ></script>
        <script
          type="text/javascript"
          src="../../integrations/assets/wasm_exec.js"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
                const go = new Go();
                const binPath = '../assets/xxdk.wasm'
                WebAssembly.instantiateStreaming(fetch(binPath), go.importObject).then((result) => {
                    go.run(result.instance);
        
                    // Set log level
                    LogLevel(0);
        
                    // Output log to file that can be downloaded using a button
                    const logFile = LogToFile(0, "receiver.log", 5000000);
                    document.getElementById('logFileDownload').addEventListener(
                        'click', () => download(logFile.Name(), logFile.GetFile()))
        
                    // Get element to print log messages to
                    const logOutput = document.getElementById("logOutput")
                    const htmlConsole = newHtmlConsole(logOutput)
                    const messageOutput = document.getElementById("messageOutput")
                    const messageConsole = newHtmlConsole(messageOutput)
        
                    // Get button that will stop the network follower
                    const stopNetworkFollowerBtn = document.getElementById("stopNetworkFollowerBtn")
        
                    // Client specific parameters
                    const statePath = 'channelPath';
                    const statePass = 'password';
        
      
                    document.getElementById('startNetwork').addEventListener('click', async e => {
                        try {
                            await Channels(htmlConsole, messageConsole, stopNetworkFollowerBtn,
                                ndf, statePath, statePass);
                        } catch (e) {
                            htmlConsole.error(e)
                        }
                    }, false);
        
                });
      `
          }}
        ></script>
      </Head>
      <body>
        <h1 className="mt-0">The Internet Speakeasy Client</h1>
        <div className="toolbar">
          <input
            type="button"
            value="Clear localStorage"
            onClick={() => {
              localStorage.clear();
            }}
          />
          <input type="button" value="Download Log File" id="logFileDownload" />
          <input
            type="button"
            value="Stop Network Follower"
            id="stopNetworkFollowerBtn"
            style={{ display: "none" }}
          />
        </div>
        <form id="startCmix">
          <div>
            <p>
              Click on the button below to connect to the network and start the
              client.
            </p>
            <input type="button" id="startNetwork" value="Connect to Network" />
          </div>
        </form>
        <form id="makeChannel">
          <div>
            <label htmlFor="username1">Username</label>
            <br />
            <input type="text" id="username1" disabled />
          </div>
          <div>
            <label htmlFor="chanName">Speakeasy Name</label>
            <br />
            <input type="text" id="chanName" required disabled />
          </div>
          <div>
            <label htmlFor="chanDescription">Speakeasy Description</label>
            <br />
            <input type="text" id="chanDescription" required disabled />
          </div>
          <input
            type="button"
            value="Make Speakeasy"
            id="makeChannelSubmit"
            disabled
          />
        </form>
        <form id="joinChannel">
          <div>
            <label htmlFor="username2">Username</label>
            <br />
            <input type="text" id="username2" disabled />
          </div>
          <div>
            <label htmlFor="prettyPrintInput">Speakeasy to Join</label>
            <br />
            <input type="text" id="prettyPrintInput" required disabled />
            <input
              type="button"
              value="Join Speakeasy"
              id="joinChannelSubmit"
              disabled
            />
          </div>
        </form>
        <form id="channelInfo">
          <div>
            <label htmlFor="chanNameOutput">Speakeasy Name</label>
            <br />
            <input type="text" id="chanNameOutput" disabled />
          </div>
          <div>
            <label htmlFor="chanDescriptionOutput">Speakeasy Description</label>
            <br />
            <input type="text" id="chanDescriptionOutput" disabled />
          </div>
          <div>
            <label htmlFor="chanIdOutput">Speakeasy ID</label>
            <br />
            <input type="text" id="chanIdOutput" disabled />
          </div>
          <div>
            <label htmlFor="prettyPrintOutput">Speakeasy Share</label>
            <br />
            <input type="text" id="prettyPrintOutput" disabled />
          </div>
        </form>
        <div>
          <label htmlFor="message" id="messageLabel">
            Message to Send
          </label>
          <br />
          <input type="text" id="message" required disabled />
          <input type="button" value="Send" id="sendMessageSubmit" disabled />
        </div>
        <div id="messageOutput" className="htmlOutput"></div>
        <div id="logOutput" className="htmlOutput"></div>
      </body>
    </>
  );
};

export default Demo;
