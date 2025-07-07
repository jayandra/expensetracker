import consumer from "channels/consumer"

consumer.subscriptions.create("ExpensesChannel", {
  connected() {
    // Called when the subscription is ready for use on the server
    console.log("connectd called in client")
  },

  disconnected() {
    // Called when the subscription has been terminated by the server
    console.log("disconnectd called in client")
  },

  received(data) {
    // Called when there's incoming data on the websocket for this channel
    if (data.action === "expense_created") {
      const expensesList = document.getElementById("expenses");
      expensesList.insertAdjacentHTML("afterbegin", data.expense);
      
      // Adding some animation and background to the newly added expense
      const newRow = expensesList.querySelector("tr:first-child");
      newRow.classList.add("opacity-0", "transition-opacity", "duration-3000", "bg-green-100", "border", "border-green-400", "text-green-700");
      setTimeout(() => {
        newRow.classList.add("opacity-100");
      }, 1000);
    }
  }
});
