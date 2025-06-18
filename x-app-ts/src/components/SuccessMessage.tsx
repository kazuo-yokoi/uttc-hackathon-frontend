export const SuccessMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-center">
    {message}
  </div>
);
