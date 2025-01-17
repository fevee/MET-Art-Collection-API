import React, { useState, useEffect } from "react";
import "./styles.css";
import "mvp.css";

const API_URL =
  "https://collectionapi.metmuseum.org/public/collection/v1/objects";

const Artwork = ({ artwork }) => {
  const isImageAccessible =
    artwork.primaryImage && !artwork.primaryImage.includes("access/copyright");
  return (
    <div className="artwork">
      <h3>{artwork.title}</h3>
      <h4>{artwork.artistDisplayName}</h4>
      <p>{artwork.objectDate}</p>
      <p>Medium: {artwork.medium}</p>
      <p>Accession Year: {artwork.accessionYear}</p>
      <p>Department: {artwork.department}</p>
      <p>{artwork.culture}</p>
      <a href={artwork.objectURL} target="_blank" rel="noopener noreferrer">
        View Details
      </a>
      <br />
      {isImageAccessible ? (
        <img src={artwork.primaryImage} alt={artwork.title} />
      ) : (
        <p>This image is not available due to copyright restrictions.</p>
      )}
    </div>
  );
};

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search titles..."
        value={searchQuery}
        onChange={handleInputChange}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        setArtworks(data.objectIDs);
      });
  }, []);

  const fetchRandomArtwork = () => {
    setLoading(true);
    setSearchResults([]); // Clear search results
    setSearchQuery(""); // Clear search bar input not working???
    const randomIndex = Math.floor(Math.random() * artworks.length);
    fetch(`${API_URL}/${artworks[randomIndex]}`)
      .then((response) => response.json())
      .then((data) => {
        setSearchResults([data]);
        setLoading(false);
      });
  };

  const handleSearch = (query) => {
    setLoading(true);
    setSearchPerformed(true); // Set search performed to true
    if (query.trim() === "") {
      setSearchResults([]);
      setLoading(false);
      return;
    } else {
      fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`
      )
        .then((response) => response.json())
        .then((data) => {
          setLoading(false);
          if (data.objectIDs && data.objectIDs.length > 0) {
            const objectIDs = data.objectIDs.slice(0, 12);
            Promise.all(
              objectIDs.map((objectID) =>
                fetch(`${API_URL}/${objectID}`).then((response) =>
                  response.json()
                )
              )
            ).then((artworks) => {
              setSearchResults(artworks);
            });
          } else {
            setSearchResults([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
          setSearchResults([]);
          setLoading(false);
        });
    }
  };

  return (
    <div className="App">
      <h1>Metropolitan Museum of Art</h1>
      <h2>Collection Database</h2>
      <div className="header-image-container">
        <img
          src="https://images.unsplash.com/photo-1584994799933-e4f717e88632?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          className="header-image"
          alt="Metropolitan Museum of Art"
        />
      </div>
      <p>
        Welcome to the MET Collection Database. Here you can search for artworks
        by title or by keyword.
      </p>
      <SearchBar onSearch={handleSearch} />
      <button onClick={fetchRandomArtwork} className="random-button">
        Random
      </button>
      {loading && <p>Loading...</p>}
      {searchPerformed && !loading && searchResults.length === 0 && (
        <p>No results found.</p>
      )}
      {!loading &&
        searchResults.map((result) => (
          <Artwork key={result.objectID} artwork={result} />
        ))}
      <footer>
        <small>
          The Metropolitan Museum of Art. All rights reserved<br></br>
          1000 Fifth Avenue New York, NY 10028
        </small>
      </footer>
    </div>
  );
}
