#include "Arduino.h";
#include "db.h";

#ifndef control_h
#define control_h
    class Control{
        private:
            Database db;
            void autoMode();
            void mannualMode();
        public:
            void connectFirebase();
            void run();
            void initStream();
            bool canExecute();
    };
#endif