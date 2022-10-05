import React from "react";
import Modal from "components/common/Modal";
import { ModalCtaButton } from "@components/common";

class ErrorBoundary extends React.Component<
  { children: any },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI

    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // You can use your own error logging service here
    console.log({ error, errorInfo });
  }
  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        // <Modal
        //   onClose={() => {
        //     this.setState({ hasError: false });
        //   }}
        // >
        //   <div className="w-full flex flex-col justify-center items-center">
        //     <h2 className="mt-9 mb-4">Oops, there is an error!</h2>
        //     <ModalCtaButton
        //       buttonCopy="Ok"
        //       cssClass="mt-5 mb-10"
        //       onClick={() => {
        //         this.setState({ hasError: false });
        //       }}
        //     />
        //   </div>
        // </Modal>
        <div>
          <h2>Oops, there is an error!</h2>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again?
          </button>
        </div>
      );
    }

    // Return children components in case of no error

    return this.props.children;
  }
}

export default ErrorBoundary;
