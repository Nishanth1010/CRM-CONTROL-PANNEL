import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

type EmployeeOption = {
  id: number;
  name: string;
};

type Props = {
  companyId: string;
  selectedEmployeeId: number | null;
  setSelectedEmployeeId: (id: number | null) => void;
};

const EmployeeAutocomplete: React.FC<Props> = ({ companyId, selectedEmployeeId, setSelectedEmployeeId }) => {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!employeeName) return;

    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{ data: EmployeeOption[] }>(
          `/api/${companyId}/search-employees?search=${employeeName}`
        );
        setEmployeeOptions(response.data.data);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [employeeName, companyId]);

  return (
    <Autocomplete
      options={employeeOptions}
      getOptionLabel={(option) => option.name}
      value={employeeOptions.find((option) => option.id === selectedEmployeeId) || null}
      onInputChange={(event, newInputValue) => setEmployeeName(newInputValue)}
      onChange={(event, newValue) => setSelectedEmployeeId(newValue?.id || null)}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Assign to (Employee)"
          variant="outlined"
          required
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default EmployeeAutocomplete;
