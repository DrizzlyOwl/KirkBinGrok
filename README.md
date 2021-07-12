# KirkBinGrok

To run this nodejs app, clone the repo, run `npm install` then run `node index.js`

## Dependencies
This app uses Google's Puppetteer to interact directly with the Kirklees Council website. You'll need Node JS installed on your computer first and then you'll need to install the dependencies using `npm install`

## How it works
Firstly, it loads the Kirklees Council Bin Date page which prompts for a house name or number, and associated post code. The app will prompt you for these details, then it will submit the form on your behalf, wait for the page to reload, then parse the returned HTML to source some key information such as a link to a printable PDF calendar, and also your UPRN (Unique PRoperty Number). Once it knows the UPRN, it then loads a new URL which typically shows the visitor a grid layout of dates with an image that shows the colour of the bin. Finally, the app parses this HTML and collates the dates and bin colours together, then prints the output to the screen along with a link to your calendar PDF.
