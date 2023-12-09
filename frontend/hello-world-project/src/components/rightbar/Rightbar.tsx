import React, { useState } from 'react'
import './rightbar.css'
import { Chip, Stack, TextField } from '@mui/material';
import Github from '../../pages/Github/Github';

interface RightBarProps {
  onChange: (value: string[]) => void;
  value: string[];
}

export default function Rightbar({value, onChange}: RightBarProps) {
  const [category, setCategory] = useState<string>()

  return (
    <div className='rightbar'>
      <TextField label='Category' onChange={(event) => {
              setCategory(event.target.value)
          }} />
      <button
          className="postButton"
          onClick={() => {
              let categoriesCopy = value.slice()
              if (category && !!!value.find((value) => value === category))
                  categoriesCopy.push(category)
              onChange(categoriesCopy)
          }}>
              Set Category
          </button>
      <Stack direction={'row'}>
          {
              value.map((category) => {
                  return <Chip label={category} key={category} onDelete={(event) => {
                      let categoriesCopy = value.slice()
                      onChange(categoriesCopy.filter((value) => value !== category))
                  }} />
              })
          }
      </Stack>      

    </div>
  )
}
