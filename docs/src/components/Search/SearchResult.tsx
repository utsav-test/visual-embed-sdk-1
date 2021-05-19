import React from 'react';

type SearchResultProps = {
    index: number;
    highlightedIndex: number;
    keyword: string;
    title: string;
};

const SearchResult = (props: SearchResultProps) => (
    <div
        className="textContainer"
    >
        <p className="title">{props.keyword}</p>
        <p className="footer">{props.title}</p>
    </div>
);

export default SearchResult;
