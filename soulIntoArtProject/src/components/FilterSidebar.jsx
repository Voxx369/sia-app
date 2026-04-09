import { useState } from 'react';
import './FilterSidebar.css';

export default function FilterSidebar({ onFilterChange, initialFilters = {} }) {
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [selectedFormats, setSelectedFormats] = useState(initialFilters.formats || []);
  const [selectedDisciplines, setSelectedDisciplines] = useState(initialFilters.disciplines || []);
  const [selectedLevels, setSelectedLevels] = useState(initialFilters.levels || []);

  const formats = [
    { id: 'live', label: 'Live' },
    { id: 'replay', label: 'Replay' },
    { id: 'on-demand', label: 'À la demande' }
  ];

  const disciplines = [
    { id: 'aquarelle', label: 'Aquarelle' },
    { id: 'danse', label: 'Danse' },
    { id: 'dessin', label: 'Dessin' },
    { id: 'peinture', label: 'Peinture' },
    { id: 'sculpture', label: 'Sculpture' },
    { id: 'photographie', label: 'Photographie' }
  ];

  const levels = [
    { id: 'beginner', label: 'Débutant' },
    { id: 'intermediate', label: 'Intermédiaire' },
    { id: 'advanced', label: 'Avancé' }
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    emitFilterChange({ search: value });
  };

  const handleFormatToggle = (formatId) => {
    const newFormats = selectedFormats.includes(formatId)
      ? selectedFormats.filter(f => f !== formatId)
      : [...selectedFormats, formatId];
    setSelectedFormats(newFormats);
    emitFilterChange({ formats: newFormats });
  };

  const handleDisciplineToggle = (disciplineId) => {
    const newDisciplines = selectedDisciplines.includes(disciplineId)
      ? selectedDisciplines.filter(d => d !== disciplineId)
      : [...selectedDisciplines, disciplineId];
    setSelectedDisciplines(newDisciplines);
    emitFilterChange({ disciplines: newDisciplines });
  };

  const handleLevelToggle = (levelId) => {
    const newLevels = selectedLevels.includes(levelId)
      ? selectedLevels.filter(l => l !== levelId)
      : [...selectedLevels, levelId];
    setSelectedLevels(newLevels);
    emitFilterChange({ levels: newLevels });
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedFormats([]);
    setSelectedDisciplines([]);
    setSelectedLevels([]);
    onFilterChange({
      search: '',
      formats: [],
      disciplines: [],
      levels: []
    });
  };

  const emitFilterChange = (updates) => {
    onFilterChange({
      search: searchQuery,
      formats: selectedFormats,
      disciplines: selectedDisciplines,
      levels: selectedLevels,
      ...updates
    });
  };

  const hasActiveFilters = searchQuery || selectedFormats.length > 0 ||
                          selectedDisciplines.length > 0 || selectedLevels.length > 0;

  return (
    <aside className="filter-sidebar">
      {/* Search Box */}
      <div className="filter-section">
        <input
          type="text"
          placeholder="Rechercher un cours..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="filter-search"
        />
      </div>

      {/* Format Filter */}
      <div className="filter-section">
        <h3 className="filter-title">Format</h3>
        <div className="filter-options">
          {formats.map(format => (
            <label key={format.id} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedFormats.includes(format.id)}
                onChange={() => handleFormatToggle(format.id)}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">{format.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Discipline Filter */}
      <div className="filter-section">
        <h3 className="filter-title">Discipline</h3>
        <div className="filter-options">
          {disciplines.map(discipline => (
            <label key={discipline.id} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedDisciplines.includes(discipline.id)}
                onChange={() => handleDisciplineToggle(discipline.id)}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">{discipline.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Level Filter */}
      <div className="filter-section">
        <h3 className="filter-title">Niveau</h3>
        <div className="filter-options">
          {levels.map(level => (
            <label key={level.id} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedLevels.includes(level.id)}
                onChange={() => handleLevelToggle(level.id)}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button onClick={handleClearAll} className="filter-clear-btn">
          Effacer les filtres
        </button>
      )}
    </aside>
  );
}
