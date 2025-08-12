export const createKeyboardHandler = (callback: () => void, key: string = 'Enter') => {
  return (e: React.KeyboardEvent) => {
    if (e.key === key && !e.shiftKey) {
      e.preventDefault();
      callback();
    }
  };
};

export const createEnterKeyHandler = (callback: () => void) => {
  return createKeyboardHandler(callback, 'Enter');
};

// export const withEnterKeyHandler = <T extends object>(
//   Component: React.ComponentType<T>,
//   onEnterPress: () => void
// ) => {
//   return (props: T) => {
//     const handleKeyDown = createEnterKeyHandler(onEnterPress);
    
//     return (
//       <div onKeyDown={handleKeyDown}>
//         <Component {...props} />
//       </div>
//     );
//   };
// };
