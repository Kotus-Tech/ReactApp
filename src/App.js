import './App.css'; // Imports the CSS styling file
import React, { useState, useEffect } from 'react'; // Imports the hook https://www.w3schools.com/REACT/react_usestate.asp

function App() {
  const [crimeData, setCrimeData] = useState([]); // See the useState page again
  const [loading, setLoading] = useState(false); // false is because its a boolean
  const [error, setError] = useState(null);
// https://www.w3schools.com/REACT/react_es6_destructuring.asp - the destructuring lesson
  const [postcode, setPostcode] = useState(''); // 
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => { // https://www.w3schools.com/REACT/react_useeffect.asp 
    // https://www.w3schools.com/REACT/react_hooks.asp is helpful to remember how this works
    fetch('https://data.police.uk/api/crime-categories') // If you paste this into the browser it gives the list of all the categories. It's an array.
    // https://rapidapi.com/guides/fetch-api-react#using-the-fetch-api-in-react
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        setError(`Error fetching categories: ${err.message}`);
      });
  }, []);

  const fetchCrimeData = () => {
    setLoading(true); // This is the from the useState hook still, from this thread https://www.reddit.com/r/reactjs/comments/p9o49g/can_someone_explain_what_setloading_does_and_why/
    setError(null); // this is to reset any errors
    setCrimeData([]); // this sets it to blank

    if (!postcode) { // this is to show the error if the postcode is not input (!)
      setError('Please enter a valid postcode');
      setLoading(false);
      return;
    }

    // https://postcodes.io/ from this thread https://www.reddit.com/r/gis/comments/yjkpc4/how_to_get_a_uk_town_or_city_from_a_uk_post_code/
    const postCodeAPI = `https://api.postcodes.io/postcodes/${postcode}`;

    fetch(postCodeAPI)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching location data for postcode: ${postcode}`); // new because it creates a new object with the custom message
        } // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw - this is to show the error message on screen
        return response.json(); // this is to convert it back to Json so it can be used easily in the code
      })
      .then((data) => {
        const { latitude, longitude } = data.result;

        // This uses the latitude and longitude of the postcode to fetch crime data
        const apiURL = `https://data.police.uk/api/crimes-street/all-crime?lat=${latitude}&lng=${longitude}`;

        return fetch(apiURL);
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching crime data for postcode: ${postcode}`);
        }
        return response.json();
      })
      .then((data) => {
        // This stops the double 'All Crime' appearing in the drop down list. This is hard coded.
        const filteredData = selectedCategory === 'All crime'
          ? data
          : data.filter(crime => crime.category === selectedCategory);
        setCrimeData(filteredData);
        setLoading(false);
      })
      .catch((err) => {
        setError(`Error fetching data: ${err.message}`);
        setLoading(false);
      });
  };

  // This is the main outline of the app. Remember this is JSX and NOT HTML https://www.w3schools.com/REACT/react_jsx.asp
  return (
    <div className="App">
      <header className="App-header">
        <h1>Crime Data Viewer</h1>
        <p>Enter a postcode to view recent street-level crimes.</p>
      </header>

      <main className="App-main">
        <div className="input-section">
          <label htmlFor="postcode">Postcode: </label>
          <input
            type="text"
            id="postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)} // event handlers https://www.w3schools.com/REACT/react_events.asp
            placeholder="Enter postcode"
          />
          <br />
          <label htmlFor="category">Category: </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)} // dot notation to access values of the input field
          >
            <option value="All crime">All crime</option>
            {categories
              .filter(category => category.name !== 'All crime') // As above to stop the duplication of 'All Crime' from the API
              .map((category) => ( // filters the array
                <option key={category.url} value={category.url}>
                  {category.name}
                </option>
              ))}
          </select>
          <br />
          <button onClick={fetchCrimeData}>Fetch Crime Data</button>
        </div>

        {loading && <p>Loading crime data...</p>}
        {error && <p>Error: {error}</p>}

        {crimeData.length > 0 && (
          <div className="crime-results">
            <h2>Crime Data for Postcode</h2>
            <ul>
              {crimeData.map((crime, index) => (
                <li key={index}>
                  <strong>{crime.category}</strong> - {crime.location.street.name} (Outcome: {crime.outcome_status ? crime.outcome_status.category : 'N/A'})
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>&copy; 2024 Crime Data Viewer</p>
      </footer>
    </div>
  );
}

export default App;