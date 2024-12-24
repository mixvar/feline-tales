export const AccessDenied = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8 md:gap-12">
      <div className="w-full max-w-md bg-white bg-opacity-50 rounded-lg shadow-lg p-8">
        <h2 className="text-3xl md:text-4xl font-cursive text-felineLove-dark mb-4 text-center">
          Brak dostępu
        </h2>
        <p className="text-gray-600 text-center">
          Wygląda na to, że jesteś obcym kotem. Może jak ładnie zamiauczysz do administratora, to
          przekonasz go by dał ci szansę.
        </p>
      </div>
    </div>
  );
};
