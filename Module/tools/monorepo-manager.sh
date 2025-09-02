#!/bin/zsh

# 🚀 Module Federation Monorepo Manager
# Master control script for all automation tools

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script paths
TOOLS_DIR="$(cd "$(dirname "$0")" && pwd)"
CREATE_SCRIPT="$TOOLS_DIR/create-module-enhanced.js"
DELETE_SCRIPT="$TOOLS_DIR/delete-module.js"
STATUS_SCRIPT="$TOOLS_DIR/module-status.js"

# 🎯 SHOW BANNER
showBanner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                🚀 Module Federation Monorepo                ║"
    echo "║                     Manager v2.0                           ║"
    echo "║                                                              ║"
    echo "║           Enterprise-Grade Automation System                ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 📋 SHOW HELP
showHelp() {
    echo -e "${CYAN}📋 Available Commands:${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Module Management:${NC}"
    echo "  create <module-name>     - Create new module with full automation"
    echo "  delete <module-name>     - Delete module and clean up everything"
    echo "  list                     - List all modules and their status"
    echo ""
    echo -e "${YELLOW}📊 Status & Monitoring:${NC}"
    echo "  status                   - Show comprehensive module status"
    echo "  details <module-name>    - Show detailed module information"
    echo "  health                   - Check overall system health"
    echo "  integration              - Show integration guide for Agnipariksha"
    echo ""
    echo -e "${YELLOW}🛠️  System Tools:${NC}"
    echo "  ports                    - Show port usage and conflicts"
    echo "  cleanup                  - Clean up any orphaned processes"
    echo "  help                     - Show this help message"
    echo ""
    echo -e "${YELLOW}📚 Examples:${NC}"
    echo "  ./monorepo-manager.sh create user-management"
    echo "  ./monorepo-manager.sh delete test-module"
    echo "  ./monorepo-manager.sh status"
    echo "  ./monorepo-manager.sh details grade"
    echo "  ./monorepo-manager.sh integration"
    echo ""
    echo -e "${GREEN}💡 This system automatically manages:${NC}"
    echo "   • Module creation and structure"
    echo "   • Port assignment and conflicts"
    echo "   • Webpack configuration"
    echo "   • Dependency installation"
    echo "   • Development server startup"
    echo "   • Clean module deletion"
    echo "   • System health monitoring"
}

# 🔧 CREATE MODULE
createModule() {
    local moduleName=$1
    
    if [ -z "$moduleName" ]; then
        echo -e "${RED}❌ Please provide a module name${NC}"
        echo "Example: ./monorepo-manager.sh create user-management"
        exit 1
    fi
    
    echo -e "${GREEN}🚀 Creating module: $moduleName${NC}"
    echo "This will automatically:"
    echo "  • Create module structure"
    echo "  • Install all dependencies"
    echo "  • Configure webpack"
    echo "  • Start development server"
    echo ""
    
    node "$CREATE_SCRIPT" "$moduleName"
}

# 🗑️ DELETE MODULE
deleteModule() {
    local moduleName=$1
    
    if [ -z "$moduleName" ]; then
        echo -e "${RED}❌ Please provide a module name to delete${NC}"
        echo "Example: ./monorepo-manager.sh delete user-management"
        exit 1
    fi
    
    echo -e "${YELLOW}🗑️  Deleting module: $moduleName${NC}"
    echo "This will automatically:"
    echo "  • Stop development server"
    echo "  • Remove module directory"
    echo "  • Clean up processes"
    echo "  • Free up port"
    echo ""
    
    node "$DELETE_SCRIPT" delete "$moduleName"
}

# 📊 SHOW STATUS
showStatus() {
    echo -e "${CYAN}📊 Module Status Overview${NC}"
    echo ""
    node "$STATUS_SCRIPT" status
}

# 🔍 SHOW DETAILS
showDetails() {
    local moduleName=$1
    
    if [ -z "$moduleName" ]; then
        echo -e "${RED}❌ Please provide a module name for details${NC}"
        echo "Example: ./monorepo-manager.sh details user-management"
        exit 1
    fi
    
    echo -e "${CYAN}🔍 Module Details: $moduleName${NC}"
    echo ""
    node "$STATUS_SCRIPT" details "$moduleName"
}

# 🏥 SHOW HEALTH
showHealth() {
    echo -e "${CYAN}🏥 System Health Check${NC}"
    echo ""
    node "$STATUS_SCRIPT" status
}

# 🔗 SHOW INTEGRATION
showIntegration() {
    echo -e "${CYAN}🔗 Integration Guide for Agnipariksha${NC}"
    echo ""
    node "$STATUS_SCRIPT" integration
}

# 🔌 SHOW PORTS
showPorts() {
    echo -e "${CYAN}🔌 Port Usage and Conflicts${NC}"
    echo ""
    
    # Check ports 3105-3120
    for port in {3105..3120}; do
        if lsof -i :$port >/dev/null 2>&1; then
            local process=$(lsof -ti:$port | head -1)
            local moduleName=""
            
            # Try to find module name from port
            if [ $port -ge 3105 ] && [ $port -le 3120 ]; then
                local index=$((port - 3105))
                local modules=($(ls -d apps/*/ 2>/dev/null | sed 's/apps\///' | sed 's/\///'))
                if [ $index -lt ${#modules[@]} ]; then
                    moduleName="${modules[$index]}"
                fi
            fi
            
            if [ -n "$moduleName" ]; then
                echo -e "🔴 Port $port: In Use by $moduleName (PID: $process)"
            else
                echo -e "🔴 Port $port: In Use (PID: $process)"
            fi
        else
            echo -e "🟢 Port $port: Available"
        fi
    done
}

# 🧹 CLEANUP
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up orphaned processes...${NC}"
    echo ""
    
    # Find and kill orphaned webpack processes
    local orphaned=$(ps aux | grep "webpack serve" | grep -v grep | awk '{print $2}')
    
    if [ -n "$orphaned" ]; then
        echo "Found orphaned webpack processes:"
        echo "$orphaned"
        echo ""
        echo "Killing orphaned processes..."
        echo "$orphaned" | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✅ Cleanup completed${NC}"
    else
        echo -e "${GREEN}✅ No orphaned processes found${NC}"
    fi
}

# 🎯 MAIN EXECUTION
main() {
    local command=$1
    local moduleName=$2
    
    # Show banner
    showBanner
    
    # Check if tools exist
    if [ ! -f "$CREATE_SCRIPT" ] || [ ! -f "$DELETE_SCRIPT" ] || [ ! -f "$STATUS_SCRIPT" ]; then
        echo -e "${RED}❌ Required tools not found!${NC}"
        echo "Please ensure all automation scripts are present in the tools/ directory."
        exit 1
    fi
    
    case $command in
        "create")
            createModule "$moduleName"
            ;;
        "delete")
            deleteModule "$moduleName"
            ;;
        "list"|"status")
            showStatus
            ;;
        "details")
            showDetails "$moduleName"
            ;;
        "health")
            showHealth
            ;;
        "integration")
            showIntegration
            ;;
        "ports")
            showPorts
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"--help"|"-h"|"")
            showHelp
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $command${NC}"
            echo ""
            showHelp
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
