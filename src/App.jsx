import React, {useEffect, useState} from 'react';
import {useDebounce } from 'react-use';
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import search from "./components/Search.jsx";
import {getTrendingMovies, UpdateSearchCount} from "./appwrite.js";

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [trendingMovies, setTrendingMovies] = useState([]);

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('')
        try {
            //const endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            //const endpoint = `${API_BASE_URL}/discover/tv?sort_by=popularity.desc&with_original_language=ko&with_genres=18&api_key=${API_KEY}`;
            const endpoint = query
                ? `${API_BASE_URL}/search/tv?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/tv?sort_by=popularity.desc&with_original_language=ko&with_genres=18&first_air_date.gte=2020-01-01&api_key=${API_KEY}`;

            const response = await fetch(endpoint, API_OPTIONS);
            if(!response.ok) {
                throw new Error('FAiled to fetch movies');
            }

            const data = await response.json();
            // if(data.Response === 'False'){
            //     setErrorMessage(data.Error || 'Failed to fetch dramas')
            //     setMovieList([]);
            //     return;
            // }
            // setMovieList(data.results || []);
            if (data.results) {
                // 🔹 Filter only Korean dramas
                const filteredResults = data.results.filter(movie => movie.original_language === 'ko');
                setMovieList(filteredResults);
                if(query && data.results.length > 0){
                    await UpdateSearchCount(query, data.results[0]);
                }
            } else {
                setMovieList([]);
                setErrorMessage('No results found.');
            }

        }catch (error) {
            console.log(`Error fetching movies : ${error}`);
            setErrorMessage(`Error fetching movies. Please try again later.`)
        }finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try{
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        }
        catch(error){
            console.log(`Error fetching trending movies: ${error}`);
        }
    }

    useEffect(() => {
            fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies()
    }, [])

    return (
        <main>
            <div className="pattern"/>

            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero" />
                    <h1>Find <span className="text-gradient">Kdramas</span> You'll Enjoy Without the Hassle</h1>

                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending KDramas</h2>

                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.name}/>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

               <section className="all-movies">
                   <h2>All KDramas</h2>

                   {isLoading ? (
                       <Spinner/>
                   ) : errorMessage ? (
                       <p className="text-red-500">{errorMessage}</p>
                   ) : (
                       <ul>
                           {movieList.map((movie) => (
                               <MovieCard key={movie.id} movie={movie}/>
                           ))}
                       </ul>
                   )}

               </section>
            </div>
        </main>
    )
}

export default App

