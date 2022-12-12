import { xhr } from '../js/kui-xhr.js';

interface DataProvider {
  getData() : Promise<any>;
}

class LocalDataProvider implements DataProvider {

  data: any;

  constructor(data: any) {
    this.data = data;
  }

  public async getData(): Promise<any> {
    return this.data;
  }

}

class RemoteDataProvider implements DataProvider {

  url: string;

  constructor(url: string) {
    this.url = url;
  }

  public async getData(): Promise<any> {
    return await xhr.promise({
      url: this.url,
      params: {},
    }, (error) => {
      throw error;
    });
  }

}