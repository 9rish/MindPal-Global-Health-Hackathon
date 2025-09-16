
  # Design MindPal App Screens

  This is a code bundle for Design MindPal App Screens. The original project is available at https://www.figma.com/design/ucedaxNQxAd4cNvSrR9NQ4/Design-MindPal-App-Screens.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.


Setup Instructions (README.md excerpt)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- npm or yarn

### Installation

1. *Clone the repository*
bash
git clone <repository-url>
cd career-advisor-backend


2. *Install dependencies*
bash
npm install


3. *Setup environment variables*
bash
cp .env.example .env
# Edit .env with your configuration


4. *Start MongoDB* (if not using Docker)
bash
# Using homebrew (macOS)
brew services start mongodb-community

# Using systemd (Linux)
sudo systemctl start mongod


5. *Start the development server*
bash
npm run dev


### Using Docker (Recommended)

1. *Start all services*
bash
docker-compose up -d


2. *View logs*
bash
docker-compose logs -f backend


3. *Stop services*
bash
docker-compose down

  