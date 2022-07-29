class Application{
    private static _application : Application;
    protected constructor(){
        
    }

    static getInstance() : Application{
        if(this._application == null){
            this._application = new Application();
        }
        return this._application;
    }

}
