# SendE2E Test

This test sets up two clients in the browser and has one client send an E2E
message to the other.

## Running the Test

1. First, start the network and client HTTP server using the `run.sh` script.
   This will start all the gateways and client registrar using localhost as
   their public IP addresses and the NDF will be provided by the permissioning
   server rather than downloaded from a gateway.

2. Once rounds are running, on the receiver webpage, the local HTTP server will
   start. Open http://localhost:9090 in the browser and navigate to the
   `sendE2E` directory. Open the two clients, the sender (`sender.html`) and
   receiver (`receiver.html`).

3. On the receiver page, to start the client, upload the NDF file
   `permissions-ndfoutput.json` from the `results` directory. Once the client
   generates keys and joins the network, it will prompt its contact file for
   download. Copy the contents of this file into the `recipientContactFile`
   const in `sender.html`.

4. On the sender webpage (make sure to refresh the page), select the NDF file as
   described for the recipient above. This will start the sender client. Once it
   generates its keys and joins the network, it will add the receiver client as
   a partner, they will exchange requests and confirmations, and finally, the
   sender will send an E2E message to the recipient.