/**
 *
 */
Model
  = model:(trigger:Trigger / observer:Observer) {
    return model;
  }

Trigger
  = event:Event _ '=>' _ variable:Id {
    return {
      event: event,
      variable: variable
    };
  }

Observer
  = '[' variable:Id ']' _ '=>' _ procedure:Procedure {
    return {
      variable: variable,
      procedure: procedure
    }
  }

Event
  = '(' id:Id ')' {
    return id;
  }

Action
  = '<' id:Id '>' {
    return id;
  }

Procedure
  = id:Id '(' ')' {
  	return id
  }

Id
  = [a-zA-Z]+ ('.' [a-zA-Z]+)? {
  	return text();
  }


_ 'whitespace'
  = [ \t\r\n]*
