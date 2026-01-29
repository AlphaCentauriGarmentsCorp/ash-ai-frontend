import UserProfile from "./UserProfile"

export default function Topbar() {
  return (
    <header className="bg-dark sticky-top p-3">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <input 
            className="form-control rounded-pill" 
            placeholder="Search for pages..." 
            style={{ width: "820px" }}
          />
          <div 
            className="bg-light rounded-circle d-flex align-items-center justify-content-center" 
            style={{ width: "42px", height: "42px", cursor: "pointer" }}
          >
            ðŸ””
          </div>
        </div>
        <UserProfile />
      </div>
    </header>
  )
}
