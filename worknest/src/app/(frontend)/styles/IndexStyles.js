import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';

export const MainContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 86vh;
    padding: 20px;
`;

export const SectionTitle = styled.h1`
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
`;

export const ScrollableContainer = styled.div`
	height: 400px; // Fixed height
	overflow-y: auto; // Enable vertical scrolling
	border: 1px solid #e9ecef;
	border-radius: 4px;
	margin-bottom: 2rem;
`;

export const InstrumentList = styled.ul`
	list-style-type: none;
	padding: 0;
	margin: 0;
`;

export const InstrumentItem = styled.li`
	background-color: #f8f9fa;
	border-bottom: 1px solid #e9ecef;
	padding: 1rem;
	font-size: 16px;

	&:last-child {
		border-bottom: none;
	}
`;

export const SearchContainer = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 1rem;
`;

export const SearchInput = styled.input`
	padding: 0.5rem;
	font-size: 16px;
	border: 1px solid #ccc;
	border-radius: 4px;
	margin-right: 0.5rem;
	flex-grow: 1;
`;

export const SearchButton = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	font-size: 20px;
	color: #071d49;
`;

export const SearchIcon = styled(FaSearch)`
	color: #071d49;
`;